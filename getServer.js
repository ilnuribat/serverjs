var Var = require('./variables.js');

var Get = Var.app.get('/get', function(request, response) {
  response.send("Hello from getServer.js");
});

var Cities = Var.app.get('/cities', function(request, response) {
  Var.fileSystem.readFile('./cities.txt', 'utf-8', function(error, FSdata) {
    if(error) throw error;
    console.log("Hello from getCitiesServer.js");
    response.send(FSdata);
  })
});

var Data = Var.app.get('/data', function(request, response) {
  response.set('Content-Type', 'application/json');
//  response.send(JSON.stringify(Var.data));
  response.send(Var.data);
});

var qDriver = Var.app.get('/qdriver', function(request, response) {
  response.send(Var.qDriver);
});

var qPassanger = Var.app.get('/qpassanger', function(request, response) {
  response.send(Var.qPassanger);
});

exports.Data = Data;
exports.Get = Get;
exports.Cities = Cities;
exports.qDriver = qDriver;
exports.qPassanger = qPassanger;
