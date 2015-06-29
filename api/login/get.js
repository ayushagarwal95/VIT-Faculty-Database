'use strict';

var unirest = require('unirest');
var cache = require('memory-cache');

exports.get = function (app, data, callback) {
  let captchaUri = 'https://academics.vit.ac.in/student/captcha.asp';
  var onRequest = function (response) {
      if (response.error) {
          callback(true, null);
      }
      else {
          let validity = 2;
          let key = Object.keys(response.cookies)[0];
          let cookieSerial = key + '=' + response.cookies[key];
          let doc = {
              reg_no: data.reg_no,
              cookie: cookieSerial
          };
          cache.put(data.reg_no, doc, validity * 60 * 1000);
          callback(null, response.body);
      }
    };
  unirest.get(captchaUri)
    .encoding(null)
    .timeout(26000)
    .end(onRequest);
};
