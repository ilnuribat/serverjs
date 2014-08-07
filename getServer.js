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
  if(direction == undefined)
  {
    response.send("unknown direction");
    return;
  }
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
});

Var.app.get('/direction', function(request, response) {
  var query = Var.url.parse(request.url).query;
  var params = Var.queryString.parse(query);
  var source = params["source"];
  var destination = params["destination"];
  sql.main("select id from direction where id_source = " + source + " and id_destination = " + destination + ";", function(error, rows) {
    var directionID = "";
    if(rows[0] != null)
      directionID = rows[0]["id"]; 
    else 
      directionID = 0;
    response.send(JSON.stringify(directionID));
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

Var.app.get('/dropFromQueue', function(request, response) {
  var query = Var.url.parse(request.url).query;
  var params = Var.queryString.parse(query);
  console.log(params);
  var human = params["human"];
  var id = params["id"];
  var direction = params["direction"];
  var time = params["time"];
  sql.main("delete from q" + human + " where id_" + human + " = " + id + " and id_direction = " + direction + " and id_time = " + time + ";", function(error, rows) {
    if(error) {
      console.log(error);
      response.send("error with dropping from queue");
      return;
    }
    
    if(human == "driver") {
      for(var iDrive = 0; iDrive < Var.qDriver[direction][time].length; iDrive++) {
        if(Var.qDriver[direction][time][iDrive]["id"] == id) {
          Var.qDriver[direction][time].splice(iDrive, 1);
          console.log("driver with id = " + id + " was dropped from queue");
          response.send("driver with id = " + id + " was dropped from queue");
        }
      }
    }
    
    if(human == "passganer") {
      for(var iDrive = 0; iPass< Var.qPassanger[direction][time].length; iPass++) {
        if(Var.qPassanger[direction][time][iPass]["id"] == id) {
          Var.qPassanger[direction][time].splice(iPass, 1);
          console.log("passanger with id = " + id + " was dropped from queue");
          response.send("passanger with id = " + id + " was dropped from queue");
        }
      }
    }
    //response.send(JSON.stringify(rows));
  });
});

Var.app.get('/vardriver', function(request, response) {
  response.send(JSON.stringify(Var.dirver));
})

exports.Data = Data;
exports.Get = Get;
exports.Cities = Cities;
exports.qDriver = qDriver;
exports.qPassanger = qPassanger;
exports.url = url;
exports.sqlGet = sqlGet;
