'use strict';

var cheerio = require('cheerio');
var path = require('path');
var unirest = require('unirest');
var cache = require('memory-cache');

exports.get = function (app, data, callback) {
    if (cache.get(data.reg_no) !== null) {
        var CookieJar = unirest.jar();
        let cookieSerial = cache.get(data.reg_no).cookie;
        let submitUri = 'https://academics.vit.ac.in/student/stud_login_submit.asp';
        CookieJar.add(unirest.cookie(cookieSerial), submitUri);
        var onPost = function (response) {
            delete data['captcha'];
            if (response.error) {
                callback(true, data);
            }
            else {
                try {
                    var scraper = cheerio.load(response.body);
                    var htmlTable = cheerio.load(scraper('table').eq(1).html());
                    let text = htmlTable('td font').eq(0).text();
                    text = text.split(' - ')[0].replace(/[^a-zA-Z0-9]/g, '');
                    if (text === data.reg_no) {
                        let validity = 3;
                        let doc = {
                            reg_no: data.reg_no,
                            password: data.password,
                            cookie: cookieSerial
                        };
                        cache.put(data.reg_no, doc, validity * 60 * 1000);
                        console.log('Login Successful');
                        callback(null, data)
                    }
                    else {
                        console.log('Error in Login or Invalid Credentials');
                        callback(true, data);
                    }
                }
                catch (ex) {
                    console.log('Error in Scraping');
                    callback(true, data);
                }
            }
        };
        unirest.post(submitUri)
            .jar(CookieJar)
            .form({
                regno: data.reg_no,
                passwd: data.password,
                vrfcd: data.captcha
            })
            .timeout(28000)
            .end(onPost);
    }
};
