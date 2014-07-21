var Var = require('./variables.js');
var get = require('./getServer.js');
var post = require('./postServer.js');
var init = require('./init.js');

var queue = require('./makeQueue.js');

get.Data;
get.Get;
get.Cities;
get.qDriver;
get.qPassanger;
get.url;
get.sqlGet;

post.qDriver;
post.qPassanger;
post.registration;

queue.find;

Var.app.listen(80);
console.log("Server started");
