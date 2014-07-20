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
var Url = require("url");
var queryString = require("querystring");
var clone = require('clone');

var time_status_obj = {
  "passanger_count": 0,
  "driver_count": 0,
  "success_count": 0
}
var data = {
  "0": extend({}, time_status_obj),
  "3": extend({}, time_status_obj),
  "6": extend({}, time_status_obj),
  "9": extend({}, time_status_obj),
  "12": extend({}, time_status_obj),
  "15": extend({}, time_status_obj),
  "18": extend({}, time_status_obj),
  "21": extend({}, time_status_obj)
}
//для проверки введенных данных с телефона
var time = {
  1: "yes",
  2: "yes",
  3: "yes",
  4: "yes",
  5: "yes",
  6: "yes",
  7: "yes",
  8: "yes"
}
var directionSize;
var qDriver = [];
var qPassanger = [];
var met = [];


exports.met = met;
exports.app = app;
exports.fileSystem = fileSystem;
exports.data = data;
exports.qDriver = qDriver;
exports.qPassanger = qPassanger;
exports.url = url;
exports.time = time;
exports.mysql = mysql;
exports.url = url;
exports.queryString = queryString;
exports.directionSize = directionSize;