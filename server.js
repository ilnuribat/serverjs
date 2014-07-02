var Var = require('./variables.js');
var get = require('./getServer.js');
var post = require('./postServer.js');
var QueueExe = require('./makeQueue.js');

get.Data;
get.Get;
get.Cities;

post.Post;
post.qDriver;
post.qPassanger;

QueueExe.findQueue;

Var.app.listen(80);

console.log("Server started");
