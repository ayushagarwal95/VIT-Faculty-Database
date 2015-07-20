'use strict';

var unirest = require('unirest');
var cheerio = require('cheerio');
var cache = require('memory-cache');
var fs = require('fs');
var path = require('path');
var link = require(path.join(__dirname, '..', '..', 'link'));

var links = link.links;

exports.get = function (app, data, callback) {

    var CookieJar = unirest.jar();
    let cookieSerial = cache.get(data.reg_no).cookie;
    CookieJar.add(unirest.cookie(cookieSerial), links[0]);
    let onGet = function (response) {
        if (response.error) {
            callback(true, null);
        }
        else {
            console.log(response.body);
            callback(null, null);
            /*
            if (cache.get(data.reg_no) !== null) {
                console.log(response.body);
                /*
                let cacheDoc = cache.get(data.reg_no);
                if (cacheDoc.password === data.password) {
                    try {
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
                        callback(null, data);
                    }
                    catch (ex) {
                        callback(true, null);
                    }
                }
                else {
                    console.log('Invalid Credentials');
                    callback(true, null);
                }
            }*/
        }
    };
    unirest.get(links[0])
    .jar(CookieJar)
    .end(onGet);
};
