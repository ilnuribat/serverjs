var Var = require('./variables.js');
require('./getServer.js');
require('./postServer.js');
require('./init.js');
require('./makeQueue.js').find();
Var.app.listen(80);
console.log("Server started");

