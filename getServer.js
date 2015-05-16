/*
*
*	В данном модуле описаны все функции, которые обрабатывают Get запросы. 
*	Позже модули будут иметь другой, более логичный, компактный, интуитивный вид.
*
*/

var Var = require('./variables.js');
var sql = require('./sql.js');
var queue = require('./makeQueue.js');
	
//Выдача состояния очереди в указанном направлении
Var.app.get('/data', function(request, response) {
    var query = Var.url.parse(request.url).query;
	var params = Var.queryString.parse(query);
    var direction = params["direction"] - 0;
    var date = params["date"] - 0;
    if (date < 0 || date > 999999) {
        response.send("unknown date");
        return;
    }
    if (direction > Var.directionSize || direction < 0) {
		response.send("unknown direction");
		return;
    }
    var sqlQuery = 
        "SELECT time.id, time.name AS 'time', count(qpassenger.id) AS 'passengers', count(qdriver.id) AS 'drivers' " +
        //    ",qdriver.date, qpassenger.date " +
        "FROM time " +
        "LEFT JOIN qpassenger ON qpassenger.id_time = time.id " +
        "LEFT JOIN qdriver ON qdriver.id_time = time.id " +
        "WHERE (qdriver.date = " + date + "  AND qdriver.id_direction = " + direction + ") " +
        "OR ( qpassenger.date = " + date + " AND qpassenger.id_direction = " + direction + ")" +
        "GROUP BY time.id " +
    
        "UNION " +
    
        "SELECT time.id, time.name, 0 AS 'passenger', 0 AS 'driver' " + //", NULL, NULL " +
        "FROM time " +
        "WHERE time.id NOT IN( " +
            "SELECT time.id " +
            "FROM time " +
            "LEFT JOIN qpassenger ON qpassenger.id_time = time.id " +
            "LEFT JOIN qdriver ON qdriver.id_time = time.id " +
            "WHERE (qdriver.date = " + date + "  AND qdriver.id_direction = " + direction + ") " +
            "OR ( qpassenger.date = " + date + " AND qpassenger.id_direction = " + direction + ")" +
            "GROUP BY time.id " +
        ") " +
        "GROUP BY id " +
        "ORDER BY id " +
        ";";

    var oldSqlQuery = "SELECT COUNT(id), id_time FROM qdriver WHERE id_direction = " + direction + 
        " AND date = " + date + " GROUP BY id_time;";
    sql.main(sqlQuery, function (error, rows) {
        response.send(rows);
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
	sql.main("SELECT * FROM	towns;", function(error, rows) {
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
    if (human != "driver" && human != "passenger") {
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
    
    sql.main("SELECT id FROM " + human + " WHERE id = " + id + ";", function (error, rows) {
        if (rows[0] == undefined) {
            console.log("DropFromQueue: There is no such user:" + id);
            response.send("there is no such user");
            return;
        }
		//Если пассажир: нужно проверить, не взял ли он уже водителя
		//Если взял, то нужно добавить 1 свободное место для водителя
		//Пассажира, соответственно, снять с очереди. 
		//Для начала проверить qpassenger
        if (human == "passenger") {
            var sqlSTR = "DELETE FROM qpassenger WHERE id_passenger = " + id + " AND id_direction = " + 
						direction + " AND id_time = " + time + " AND date = " + date + ";";
            sql.main(sqlSTR, function (error, rows) {
                if (rows["affectedRows"] == 1) {
                    //Был единственный в очереди, сняли с очереди
                    response.send("success");
                }
                if (rows["affectedRows"] > 1) {
                    //Здесь нужно поосторожнее. Один и тот человек встал два раза в одну и то же (время, направляние, дата)
                    //Всех удалили. Такого в идеале не должно быть. В будущем нужно учитывать, сколько раз встают в очередь
                    response.send("warning: there were more than one of YOU");//забавано получилось
                } else if (rows["affectedRows"] == 0) {
                    //Пассажира нету в очереди. Видимо, уже нету. Нужно проверить
                    //Теперь надо отправиться на server.met
                    //Тут уже просто так сделать DELETE не получится. Нужно смотреть, кого удаляем.
                    //Вернуть товарища в очередь, вернуть место водителю
                    sql.main("SELECT id, id_driver, booked FROM met WHERE id_passenger = " + id + " AND id_direction = " + direction + 
                        " AND id_time = " + time + " AND date = " + date + ";", function (error, rows) {
                        if (rows.length == 1) {
                            var id_driver = rows[0]["id_driver"];
                            var bookedMet = rows[0]["booked"];
                            console.log(id_driver, ", ", bookedMet);
                            //Всё ок. пока всё хорошо
                            //Вернем места водителю
                            var sqlString = "INSERT INTO qdriver(id_driver, id_direction, id_time, date, seats) VALUES(" + id_driver + ", " + direction +
                                ", " + time + ", " + date + ", " + bookedMet + ") ON DUPLICATE KEY UPDATE seats = seats + " + bookedMet + ";";
                            sql.main(sqlString, function (error, rows) {
                                console.log(rows);
                            });
                            //Выкинем пассажира из очереди, пусть выбирает другой, заново встает.
                            sql.main("DELETE FROM met WHERE id_driver = " + id_driver + " AND id_passenger = " + id + " AND id_direction = " + direction + 
                                " AND id_time = " + time + " AND date = " + date + ";", function (error, rows) {
                                response.send("success");
                            });
                        }
                        
                    });
                }
            });
        } else {
            //Если водитель, то мы можем снять с очееди только в том случае, если у него 
            var sqlStr = "DELETE FROM qdriver WHERE id_driver = " + id + " AND id_direction = " + 
						direction + " AND id_time = " + time + " AND date = " + date + ";"
            sql.main(sqlSTR, function (error, rows) {
                if (error)
                    response.send(error);
                else response.send("success");
            });
            
        }
    });

    
});

//Состояние очереди
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

Var.app.get('/destTowns', function (request, response) {
    var query = Var.url.parse(request.url).query;
    var params = Var.queryString.parse(query);
    var sourceTown = params["source"];
    var date = params["date"];
    var ahuman = params["human"] == "driver" ? "qpassenger" : "qdriver";
    var sqlQuery = 'SELECT id, russianName FROM towns';
    sql.main(sqlQuery, function (error, towns) {
        var fullTowns = {};
        towns.forEach(function (townName) {
            fullTowns[townName["russianName"]] = {};
            fullTowns[townName["russianName"]]["id"] = townName["id"];
            fullTowns[townName["russianName"]]["count"] = 0;
        });

        var queryCounts = 'SELECT towns.russianName AS "russianName", count(id_destination) AS "count" FROM ' + ahuman +
        ' INNER JOIN direction ON direction.id = id_direction INNER JOIN towns ON id_destination = towns.id ' +
        'WHERE date = ' + date + ' AND id_source = ' + sourceTown + 
        ' GROUP BY id_destination ORDER BY id_destination;';

        sql.main(queryCounts, function (error, rows) {
            var fullArray = [];
            rows.forEach(function (row) {
                fullTowns[row["russianName"]]["count"] = row["count"];
            });
            for (var oneTown in fullTowns) {
                fullArray.push(oneTown + " (" + fullTowns[oneTown]["count"] + ")" );
            }
            response.send(fullArray);
        });

    });
});
