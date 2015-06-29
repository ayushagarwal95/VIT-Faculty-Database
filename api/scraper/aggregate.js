'use strict';

var unirest = require('unirest');
var cheerio = require('cheerio');

exports.get = function (app, data, callback) {
    let facultyInfoBaseUri = 'https://academics.vit.ac.in/student/getfacdet.asp?fac=&x=';
    let date = new Date();
    let facultyInfoUri = facultyInfoBaseUri + date;
    let onPost = function (response){
        console.log(response.body);
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
    unirest.post(facultyInfoUri)
        .end(onPost);
};