'use strict';

var unirest = require('unirest');
var cheerio = require('cheerio');
var cache = require('memory-cache');
var fs = require('fs');
var path = require('path');
var empIds = require(path.join(__dirname, '..', '..', 'empIds')).empIds;
var async = require('async');
var moment = require('moment');
var momentTimezone = require('moment-timezone');

var baseUri = 'https://academics.vit.ac.in/student/stud_home.asp';
var facultyUri = 'https://academics.vit.ac.in/student/official_detail_view.asp?empid=';

exports.get = function (app, data, callback) {
    var CookieJar = unirest.jar();
    let cookieSerial = cache.get(data.reg_no).cookie;
    CookieJar.add(unirest.cookie(cookieSerial), baseUri);
    let onGet = function (response) {
        if (response.error) {
            callback(true, null);
        }
        else {
            let forEachId = function (id, asyncCallback) {
                let onGetLink = function (response) {
                    if (response.error) {
                        asyncCallback(null, null);
                    }
                    else {
                        console.log('Reached Link');
                        try {
                            var scraper = cheerio.load(response.body);
                            scraper = cheerio.load(scraper('table table').eq(0).html());
                            var faculty = {};
                            let forEach = function (i, element) {
                                var htmlRow = cheerio.load(scraper(this).html());
                                var htmlColumn = htmlRow('td');
                                if (i > 0 && i < 9) {
                                    let text = htmlColumn.eq(0).text();
                                    let key = text.replace(/ /g, "_").toLowerCase();
                                    faculty[key] = htmlColumn.eq(1).text();
                                }
                                else if (i === 9) {
                                    let text = htmlColumn.eq(0).text();
                                    let key = text.replace(/ /g, "_").toLowerCase();
                                    let openHours = cheerio.load(htmlColumn.eq(1).html());
                                    let openHourDetails = [];
                                    try {
                                        let openHoursTable = cheerio.load(openHours('table'));
                                        let forEachOpenHour = function (i, elem) {
                                            let openHourRow = cheerio.load(openHoursTable(this).html());
                                            let openHourColumn = openHourRow('td');
                                            if (i > 0) {
                                                let details = {
                                                    day: openHourColumn.eq(0).text(),
                                                    from: momentTimezone.tz(openHourColumn.eq(1).text(), 'HH:mm:ss', 'Asia/Kolkata').utc().toJSON(),
                                                    to: momentTimezone.tz(openHourColumn.eq(2).text(), 'HH:mm:ss', 'Asia/Kolkata').utc().toJSON()
                                                };
                                                openHourDetails.push(details);
                                            }
                                        };
                                        openHoursTable('tr').each(forEachOpenHour);
                                    }
                                    catch (ex) {
                                        let details = {
                                            day: null,
                                            from: null,
                                            to: null
                                        };
                                        openHourDetails.push(details);
                                    }
                                    finally {
                                        faculty[key] = openHourDetails;
                                    }
                                }
                            };
                            scraper('tr').each(forEach);
                        }
                        catch (ex) {
                            console.log('error data parsing');
                        }
                        asyncCallback(null, faculty);
                    }
                };
                let link = facultyUri + id;
                unirest.get(link)
                    .jar(CookieJar)
                    .end(onGetLink);
            };
            let allDone = function (err, results) {
                var collection = app.db.collection('faculty');
                let onInsert = function (err) {
                    if (err) {
                        console.log(err + 'Insertion');
                    }
                };
                collection.insert(results, onInsert);
            };
            async.map(empIds, forEachId, allDone);
        }
    };
    unirest.get(baseUri)
        .jar(CookieJar)
        .end(onGet);
};
