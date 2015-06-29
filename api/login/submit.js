'use strict';

var cheerio = require('cheerio');
var path = require('path');
var unirest = require('unirest');

exports.get = function (app, data, callback) {
    let submitUri = 'https://academics.vit.ac.in/student/stud_login_submit.asp';
    console.log(data);
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
                    console.log('Login Successful');
                    callback(null, data)
                }
                else {
                    console.log('Error in Login');
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
        .form({
            regno: data.reg_no,
            passwd: data.password,
            vrfcd: data.captcha
        })
        .end(onPost);
};
