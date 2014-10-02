/*
*
*	В данном модуле описаны все функции, которые обрабатывают Get запросы. 
*	Позже модули будут иметь другой, более логичный, компактный, интуитивный вид.
*
*/

var Var = require('./variables.js');
var sql = require('./sql.js');

//функция для проверки тестовой программы. Просто возращает JSON объект.
Var.app.get('/get', function(request, response) {
  var jsonData  = {
    "done": {
      "boolean": true,
      "number": 123,
      "list": [
        "field1", 
        "field2", 
        "field3", 
        "field4", 
        "поле5" 
      ]
    }
  }
  response.send(JSON.stringify(request.ip));
});

//Выдача состояние очереди в указанном направлении
Var.app.get('/data', function(request, response) {
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
  }
  response.send(JSON.stringify(Var.data));
});

//Выдача содержимого очереди водителей
Var.app.get('/qdriver', function(request, response) {
  response.send(JSON.stringify(Var.qDriver));
});

//Выдача содержимого очереди пассажиров
Var.app.get('/qpassanger', function(request, response) {
  response.send(JSON.stringify(Var.qPassanger));
});

Var.app.get('/met', function(request, response) {
  response.send(JSON.stringify(Var.met));
});

//Выдача столбца "name" таблицы, название передается в параметре запроса
Var.app.get('/sql', function(request, response) {
  var query = Var.url.parse(request.url).query;
  var params = Var.queryString.parse(query);
  sql.main("select name from " + params["table"] + ";", function(error, rows) {
    var names = [];
    for(var it in rows)
      names.push(rows[it]["name"]);
    response.send(JSON.stringify(names));
	console.log(names);
  });
});

//Возвращает код направления поездки
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

//Возвращает список доступных городов
Var.app.get('/towns', function(request, response) {
  sql.main("select * from  towns;", function(error, rows) {
    var names = [];
    for(var it in rows)
      names.push(rows[it]["russianName"]);
    response.send(JSON.stringify(names));
  });
});

//Удаление участника из очереди.
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
  });
});

Var.app.get('/vardriver', function(request, response) {
  response.send(JSON.stringify(Var.driver));
})
