/*
*
*	В данном модуле описаны все функции, которые обрабатывают Get запросы. 
*	Позже модули будут иметь другой, более логичный, компактный, интуитивный вид.
*
*/

var Var = require('./variables.js');
var sql = require('./sql.js');
var queue = require('./makeQueue.js');

//функция для проверки тестовой программы. Просто возращает JSON объект.
Var.app.get('/get', function(request, response) {
	var jsonData	= {
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
    var query = Var.url.parse(request.url).query;
	var params = Var.queryString.parse(query);
	var direction = params["direction"];
    if (direction == undefined || direction > 5 || direction < 0) {
		response.send("unknown direction");
		return;
	}
	var QData = [];
	for(var time = 1; time <= 8; time ++)
	QData.push(Var.qPassenger[direction][time].length);
	for(var time = 1; time <= 8; time ++) {
		QData.push(Var.qDriver[direction][time].length);
		
	}
	response.send(JSON.stringify(QData));
});

//Выдача содержимого очереди водителей
Var.app.get('/qdriver', function(request, response) {
	response.send(JSON.stringify(Var.qDriver));
});

//Выдача содержимого очереди пассажиров
Var.app.get('/qpassenger', function(request, response) {
	response.send(JSON.stringify(Var.qPassenger));
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
	sql.main("select * from	towns;", function(error, rows) {
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
			for(var iDrive = 0; iPass< Var.qPassenger[direction][time].length; iPass++) {
				if(Var.qPassenger[direction][time][iPass]["id"] == id) {
					Var.qPassenger[direction][time].splice(iPass, 1);
					console.log("passenger with id = " + id + " was dropped from queue");
					response.send("passenger with id = " + id + " was dropped from queue");
				}
			}
		}
	});
});

Var.app.get('/queueStatus', function (request, response) {
    var query = Var.url.parse(request.url).query;
    var params = Var.queryString.parse(query);
    var human = params["human"];
    var id = params["id"] - 0;
    var direction = params["direction"] - 0;
    var time = params["time"] - 0;
    
    //Проверка на дурака
    if (human != "driver" && human != "passenger") {
        console.log("error: incorrect human");
        response.send("error: incorrect human");
        return;
    }
    if (direction == undefined || direction > Var.directionSize || direction < 0) {
        console.log("unknown direction");
        response.send("unknown direction");
        return;
    }
    if (time == undefined || time > 8 || time < 0) {
        console.log("unknown time");
        response.send("unknown time");
        return;
    }
    if (id == undefined || id < 0) {
        console.log("unknown id");
        response.send("unknown id");
        return;
    }

    //Проверка из базы данных. Ищем такого юзера из зарегестрированных
    sql.main("SELECT id FROM " + human + " WHERE id = " + id + ";", function (error, rows) {
        if (error) {
            console.log("errorDB: verify user");
            console.log(error);
            response.send("errorDB: " + JSON.stringify(error));
            return;
        }
        if (rows.length != 1) {
            console.log("errorDB: there is no such user in DB");
            response.send("error: no such user");
            return;
        }

        //Проверка: находится ли пользователь в очереди. Проверяем q{driver/passenger}. 
        sql.main("SELECT id FROM q" + human + " where id_" + human + " = " + id + " AND id_direction = " + direction + 
            " AND id_time = " + time + ";", function (error, rows) {
            if (rows.length > 0) {
                //User is on the QUEUE!!
                response.write("queue");
            } else
                response.write("nonQueue");
            
            //Далее проверяем в met. Вдруг там номера появились
            var ahuman = (human == "driver" ? "passenger" : "driver");
            sql.main("SELECT phone, name FROM " + ahuman + " WHERE id IN (SELECT id_" + ahuman + " FROM met WHERE id_direction = " +
                direction + " AND id_time = " + time + " AND id_" + human + " = " + id + "); ", function (error, rows) {
                if (error)
                    return;
                console.log(rows);
                for (var iter in rows) {
                    response.write("." + rows[iter].phone);
                    response.write("," + rows[iter].name);
                }
                response.end();
            });
        });        
    });
});

Var.app.get('/queueFind', function (request, response) {
    response.send("queuFind started");
    queue.main();
});