'use strict';

var path = require('path');

var captchaParser = require(path.join(__dirname, 'captcha-parser'));

var login = require(path.join(__dirname, 'get'));
var submit = require(path.join(__dirname, 'submit'));


exports.get = function (app, data, callback) {
  var parseCaptcha = function (err, captchaImage) {
    if (err) {
      callback(true, captchaImage);
    }
    else {
      try {
        data.captcha = captchaParser.parseBuffer(captchaImage);
      }
      catch (ex) {
        callback(true, data);
      }
      submit.get(app, data, callback);
    }
  };
  login.get(app, data, parseCaptcha);
};
