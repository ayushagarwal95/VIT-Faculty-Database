'use strict';

var unirest = require('unirest');

exports.get = function (app, data, callback) {
  let captchaUri = 'https://academics.vit.ac.in/student/captcha.asp';
  var onRequest = function (response) {
      console.log(response.body);
      callback(null, response.body);
    };
  unirest.get(captchaUri)
    .encoding(null)
    .timeout(26000)
    .end(onRequest);
};
