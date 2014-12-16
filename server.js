var Var = require('./variables.js');
require('./getServer.js');
require('./postServer.js');
require('./init.js');
require('./makeQueue.js').main();
Var.app.listen(8080);
console.log("Server started");
