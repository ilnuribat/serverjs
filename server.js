var Var = require('./variables.js');
var get = require('./getServer.js');
var post = require('./postServer.js');
var init = require('./init.js');
var queue = require('./makeQueue.js');

Var.app.listen(20267);
console.log("Server started");
