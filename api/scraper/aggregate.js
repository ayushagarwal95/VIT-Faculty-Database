'use strict';

var unirest = require('unirest');
var cheerio = require('cheerio');
var cache = require('memory-cache');

exports.get = function (app, data, callback) {
    let facultyInfoUri = 'https://academics.vit.ac.in/student/getfacdet.asp';
    let date = new Date();
    var CookieJar = unirest.jar();
    let cookieSerial = cache.get(data.reg_no).cookie;
    let onGet = function (response){
        if (response.error) {
            callback(true, null);
        }
        else {
            try {
                console.log(response.body);
                var scraper = cheerio.load(response.body);
                scraper = cheerio.load(scraper('table table').eq(1).html());
                var forEach = function (i, element) {
                    let htmlRow = cheerio.load(scraper(this).html());
                    let htmlColumn = htmlRow('td');
                    if (i > 0) {
                        let link = htmlColumn.eq(3).attr('href');
                        console.log(link);
                    }
                };
                scraper('tr').each(forEach);
            }
            catch (ex) {
                callback(true, null);
            }
        }
    };
    CookieJar.add(unirest.cookie(cookieSerial), facultyInfoUri);
    unirest.get(facultyInfoUri)
        .query({'fac': null})
        .query({'x': date.toUTCString()})
        .jar(CookieJar)
        .end(onGet);
};