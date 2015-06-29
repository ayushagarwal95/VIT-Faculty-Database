'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient;

var apiRoutes = require(path.join(__dirname, 'routes', 'api'));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost/VITacademics';
let mongoOptions = {
    db: {
        native_parser: true,
        recordQueryStats: true,
        retryMiliSeconds: 500,
        numberOfRetries: 10
    },
    server: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 10000
        },
        auto_reconnect: true,
        poolSize: 50
    }
};

let onConnect = function (err, db) {
    if (!err) {
        app.use(function (req, res, next) {
            req.db = db;
        });
    }
};

mongoClient.connect(mongoUri, mongoOptions, onConnect);
app.use('/api', apiRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
