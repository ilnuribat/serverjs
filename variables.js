//Здесь надо описывать все глобальные переменные
//потом с помощью exports.* сделать общим для всех модулей
var express = require('express');
var extend = require('util')._extend;
var app = express();
var bodyParser = require('body-parser');
var url = require('url');
app.use(bodyParser.urlencoded());
var mysql = require('mysql');
var fileSystem = require('fs');
var Url = require('url');
var queryString = require('querystring');

var directionSize;
var qDriver = [];
var qPassenger = [];
var met = [];

exports.met = met;
exports.app = app;
exports.fileSystem = fileSystem;
exports.qDriver = qDriver;
exports.qPassenger = qPassenger;
exports.url = url;
exports.mysql = mysql;
exports.url = url;
exports.queryString = queryString;
exports.directionSize = directionSize;