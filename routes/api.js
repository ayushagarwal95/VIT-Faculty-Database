'use strict';

var express = require ('express');
var path = require ('path');
var router = express.Router();

var loginAuto = require (path.join(__dirname, '..', 'api', 'login', 'auto'));
var dataCollect = require(path.join(__dirname, '..', 'api', 'scraper', 'aggregate'));

router.post('/login', function (req, res) {
    var app = {
        db: req.db
    };
    var data = {
        reg_no: req.body.regno.toUpperCase(),
        password: req.body.password
    };
    var onGet = function (err, response) {
        res.json(response);
    };
    loginAuto.get (app, data, onGet);
});

router.post('/refresh', function (req, res) {
    var app = {
        db: req.db
    };
    var data = {
        reg_no: req.body.regno.toUpperCase(),
        password: req.body.password
    };
    var onGet = function (err, response) {
        res.json (response);
    };
    dataCollect.get (app, data, onGet);
});

module.exports = router;
