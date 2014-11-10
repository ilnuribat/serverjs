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
var clone = require('clone');

var time_status_obj = {
  "passengers": 0,
  "drivers": 0
}

var data = {
  1: extend({}, time_status_obj),
  2: extend({}, time_status_obj),
  3: extend({}, time_status_obj),
  4: extend({}, time_status_obj),
  5: extend({}, time_status_obj),
  6: extend({}, time_status_obj),
  7: extend({}, time_status_obj),
  8: extend({}, time_status_obj)
}

//В этих переменных будут храниться id -шки, чтобы не лезть в БД
var driver = [];
var passenger = [];

var directionSize;
var qDriver = [];
var qPassenger = [];
var met = [];

exports.met = met;
exports.app = app;
exports.fileSystem = fileSystem;
exports.data = data;
exports.qDriver = qDriver;
exports.qPassenger = qPassenger;
exports.url = url;
exports.mysql = mysql;
exports.url = url;
exports.queryString = queryString;
exports.directionSize = directionSize;
exports.driver = driver;
exports.passenger = passenger;