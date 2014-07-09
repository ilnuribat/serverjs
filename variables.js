//Здесь надо описывать все глобальные переменные
//потом с помощью exports.* сделать общим для всех модулей
var express = require('express');
var extend = require('util')._extend;
var app = express();
var bodyParser = require('body-parser');
var url = require('url');
app.use(bodyParser.urlencoded());

var fileSystem = require('fs');

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

var passanger_in_queue = {
  "id": "0",	//this is the phone number of passanger
  "seats": "0",	//how many seats he wants to book
  "phone_of_driver": "0" //
}

var driver_in_queue = {
  "id": "0", //this is the phone number of driver
  "seats": "0", // how many seats are free in his car
  "phone_numbers": [] // array of phone numbers
}

var time = {
  "0": "yes",
  "3": "yes",
  "6": "yes",
  "9": "yes",
  "12": "yes",
  "15": "yes",
  "18": "yes",
  "21": "yes"
}

var qDriver = [];
var qPassanger = [];
var met = [];
var Queue = [];

exports.met = met;
exports.app = app;
exports.fileSystem = fileSystem;
exports.data = data;
exports.qDriver = qDriver;
exports.qPassanger = qPassanger;
exports.url = url;
exports.time = time;
exports.driver_in_queue = driver_in_queue;
exports.passanger_in_queue = passanger_in_queue;