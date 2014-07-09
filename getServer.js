var Var = require('./variables.js');
var Url = require("url");
var qs = require("querystring");

var Get = Var.app.get('/get', function(request, response) {
  response.send("Hello from getServer.js");
});

var Cities = Var.app.get('/cities', function(request, response) {
  Var.fileSystem.readFile('./cities.txt', 'utf-8', function(error, FSdata) {
    if(error) throw error;
    console.log(request.body);
    response.send(FSdata);
  })
});


//УРРРАААА АРгентина вышла в финал!
//Шутка, получилось разобрать гет запрос по параметрам
var url = Var.app.get('/url', function(request, response) {
  var query = Url.parse(request.url).query;
  var params = qs.parse(query);
  response.send(JSON.stringify(params));
  console.log(params);
});

var Data = Var.app.get('/data', function(request, response) {
//  response.set('Content-Type', 'application/json');
//  response.send(JSON.stringify(Var.data));
  Var.data["0"]["passanger_count"] = Var.qPassanger.length;
  Var.data["0"]["driver_count"] = Var.qDriver.length;
  Var.data["0"]["success_count"] = -1;
  response.send(Var.data);
});

var qDriver = Var.app.get('/qdriver', function(request, response) {
  response.send(Var.qDriver);
});

var qPassanger = Var.app.get('/qpassanger', function(request, response) {
  response.send(Var.qPassanger);
});

var met = Var.app.get('/met', function(request, response) {
  response.send(Var.met);
});

exports.Data = Data;
exports.Get = Get;
exports.Cities = Cities;
exports.qDriver = qDriver;
exports.qPassanger = qPassanger;
exports.url = url;
