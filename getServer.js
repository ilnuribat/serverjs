var Var = require('./variables.js');
var sql = require('./sql.js');

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
  var query = Var.url.parse(request.url).query;
  var params = Var.queryString.parse(query);
  response.send(JSON.stringify(params));
  console.log(params);
});

var Data = Var.app.get('/data', function(request, response) {
  response.set('Content-Type', 'application/json');
  var query = Var.url.parse(request.url).query;
  var params = Var.queryString.parse(query);
  var direction = params["direction"];
  for(var time = 1; time <= 8; time ++) {
    Var.data[time]["passanger_count"] = Var.qPassanger[direction][time].length;
    Var.data[time]["driver_count"] = Var.qDriver[direction][time].length;
    Var.data[time]["success_count"] = 0;
  }
  response.send(JSON.stringify(Var.data));
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

var sqlGet = Var.app.get('/sql', function(request, response) {
  var query = Var.url.parse(request.url).query;
  var params = Var.queryString.parse(query);
  var Gdata;
  sql.main("select name from " + params["table"] + ";", function(error, rows) {
    var names = [];
    for(var it in rows)
      names.push(rows[it]["name"]);
    response.send(JSON.stringify(names));
  });
 
  //response.send(Gdata);
  //response.end();
});

Var.app.get('/direction', function(request, response) {
  var query = Var.url.parse(request.url).query;
  var params = Var.queryString.parse(query);
  var source = params["source"];
  var destination = params["destination"];
  console.log(params);
  sql.main("select id from direction where id_source = " + source + " && id_destination = " + destination + ";", function(error, rows) {
    console.log(rows);
    if(rows[0] != null)
      response.send(JSON.stringify(rows[0]["id"])); 
    else 
      response.send("0");
  });
});

Var.app.get('/towns', function(request, response) {
  sql.main("select russianName from  towns;", function(error, rows) {
    var names = [];
    for(var it in rows)
      names.push(rows[it]["russianName"]);
    response.send(JSON.stringify(names));
  });
});

exports.Data = Data;
exports.Get = Get;
exports.Cities = Cities;
exports.qDriver = qDriver;
exports.qPassanger = qPassanger;
exports.url = url;
exports.sqlGet = sqlGet;
