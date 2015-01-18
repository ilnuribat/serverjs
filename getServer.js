/*
*
*	В данном модуле описаны все функции, которые обрабатывают Get запросы. 
*	Позже модули будут иметь другой, более логичный, компактный, интуитивный вид.
*
*/

var Var = require('./variables.js');
var sql = require('./sql.js');
var queue = require('./makeQueue.js');
	
//Выдача состояние очереди в указанном направлении
//Два запроса в БД
Var.app.get('/data', function(request, response) {
    var query = Var.url.parse(request.url).query;
	var params = Var.queryString.parse(query);
    var direction = params["direction"] - 0;
    var date = params["date"] - 0;
    if (direction > Var.directionSize || direction < 0) {
		response.send("unknown direction");
		return;
    }
    
    //в силу кривизны рук буду делать два запроса
    sql.main("SELECT COUNT(id), id_time FROM qdriver WHERE id_direction = " + direction + 
        " AND date = " + date + " GROUP BY id_time;", function (error, rows) {
        var QUEUE = [];
        for (var i = 1; i <= 16; i++) QUEUE[i] = 0;
        for (var row in rows) {
            QUEUE[rows[row]["id_time"]] += rows[row]["COUNT(id)"];
        }
        sql.main("SELECT COUNT(id), id_time FROM qpassenger WHERE id_direction = " + direction + 
        " AND date = " + date + " GROUP BY id_time;", function (error, rows) {
            for (var row in rows) {
                QUEUE[rows[row]["id_time"] + 8] += rows[row]["COUNT(id)"];
            }
            QUEUE.splice(0, 1);
            response.send(JSON.stringify(QUEUE));
        });
    });
});

//Выдача столбца "name" таблицы, название передается в параметре запроса
Var.app.get('/sql', function(request, response) {
	var query = Var.url.parse(request.url).query;
	var params = Var.queryString.parse(query);
	sql.main("SELECT name FROM " + params["table"] + ";", function(error, rows) {
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
	sql.main("SELECT id FROM direction WHERE id_source = " + source + " and id_destination = " + destination + ";", function(error, rows) {
		var directionID = "";
		if(rows[0] != null)
			directionID = rows[0]["id"]; 
		else 
            directionID = 0;

        var now = new Date().getTime();
        while (new Date().getTime() < now + 3000) { }

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
	var id = params["id"] - 0;
	var direction = params["direction"] - 0;
    var time = params["time"] - 0;
    var date = params["date"] - 0;
    
    //Проверки на дурака
    if (human != "driver" || human != "passenger") {
        response.send("unknown human");
        return;
    }
    if (direction < 0 || direction > Var.directionSize) {
        response.send("unknown direction");
        return;
    }
    if (time < 0 || time > 8) {
        response.send("unknown time");
        return;
    }
    if (date < 0) {
        response.send("unknown date");
        return;
    }
    
    sql.main("SELECT id FROM driver WHERE id = " + id + ";", function (error, rows) {
        if (rows[0] == undefined) {
            console.log("there is no such user");
            response.send("there is no such user");
            return;
        }
        sql.main("DELETE FROM q" + human + " WHERE id_" + human + " = " + id + " AND id_direction = " + direction + " AND id_time = " + time + 
        " AND date = " + date + ";", function (error, rows) {
            if (error) {
                console.log(error);
                response.send("error with dropping from queue");
                return;
            }
            response.send("success deleted from queue");
        });
    });

    
});

Var.app.get('/queueStatus', function (request, response) {
    var query = Var.url.parse(request.url).query;
    var params = Var.queryString.parse(query);
    var human = params["human"];
    var id = params["id"] - 0;
    var direction = params["direction"] - 0;
    var time = params["time"] - 0;
    var date = params["date"] - 0;
	
    //Проверка на дурака
    if (human != "driver" && human != "passenger") {
        console.log("error: incorrect human");
        response.send("error: incorrect human");
        return;
    }
    if (direction <= Var.directionSize && direction > 0); else {
        console.log("unknown direction");
        response.send("unknown direction");
        return;
    }
    if (time <= 8 && time > 0); else {
        console.log("unknown time");
        response.send("unknown time");
        return;
    }
	if(date >= 0); else {
		console.log("unknown date");
		response.send("unknown date");
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
		sql.main("SELECT id FROM q" + human + " WHERE id_" + human + " = " + id + " AND id_direction = " + direction + " AND id_time = " +
			time + " AND date = " + date + " UNION SELECT id FROM met WHERE id_" + human + " = " + id + " AND id_direction = " + direction + 
			" AND id_time = " + time + " AND date = " + date + ";", function(error, rows) {
			
			//проверяем, вообще, этот чувак ставал в очередь?
			if(rows.length == 0){
				console.log("this human didn't stood to queue almost");
				response.send("Станьте в очередь");
				return;
			}
			
			//Проверка: находится ли пользователь в очереди. Проверяем q{driver/passenger}. 
			sql.main("SELECT id FROM q" + human + " where id_" + human + " = " + id + " AND id_direction = " + direction + 
				" AND id_time = " + time + " AND date = " + date + ";", function (error, rows) {
				if (rows.length > 0) {
					//User is on the QUEUE!!
					response.write("Мы ищем");
				} else
					response.write("Готово!");
				
				//Далее проверяем в met. Вдруг там номера появились
				var ahuman = (human == "driver" ? "passenger" : "driver");
				sql.main("SELECT phone, name FROM " + ahuman + " WHERE id IN (SELECT id_" + ahuman + " FROM met WHERE id_direction = " +
					direction + " AND id_time = " + time + " AND id_" + human + " = " + id + " AND date = " + date + "); ", function (error, rows) {
					if (error)
						return;
					for (var iter in rows) {
						response.write("." + rows[iter].phone);
						response.write("," + rows[iter].name);
					}
					response.end();
				});
			});
		});
    });
});

Var.app.get('/queueFind', function (request, response) {
    response.send("queuFind started");
    queue.main();
});