var Var = require('./variables.js');

var Get = Var.app.get('/get', function(request, response) {
  response.send("Hello from postServer.js");
});

var Cities = Var.app.get('/cities', function(request, response) {
  Var.fileSystem.readFile('./cities.txt', 'utf-8', function(error, FSdata) {
    if(error) throw error;
    console.log("Hello from postServer.js");
    response.send(FSdata);
  })
});

var Data = Var.app.get('/data', function(request, response) {
  response.set('Content-Type', 'application/json');
  response.send(JSON.stringify(Var.data));
});

exports.Data = Data;
exports.Get = Get;
exports.Cities = Cities;
