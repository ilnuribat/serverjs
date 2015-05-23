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

    var sqlQuery = 
        "SELECT time.id, time.name AS 'time', count(qpassenger.id) AS 'passengers', count(qdriver.id) AS 'drivers' " +
        "FROM time " +
        "LEFT JOIN qpassenger ON qpassenger.id_time = time.id " +
        "LEFT JOIN qdriver ON qdriver.id_time = time.id " +
        "WHERE (qdriver.date = " + date + "  AND qdriver.id_direction = " + direction + ") " +
        "OR ( qpassenger.date = " + date + " AND qpassenger.id_direction = " + direction + ")" +
        "GROUP BY time.id " +
    
        "UNION " +
    
        "SELECT time.id, time.name, 0 AS 'passenger', 0 AS 'driver' " +
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
    sql.main("SELECT id FROM direction WHERE id_source = " + source + " and id_destination = " + destination + ";", 
        function (error, rows) {
		var directionID;
		if(rows[0] != undefined)
			directionID = rows[0]["id"];
		else 
            directionID = 0;

        response.send(JSON.stringify(directionID));
	});
});

//Возвращает список доступных городов
Var.app.get('/towns', function(request, response) {
	var query = Var.url.parse(request.url).query;
	var params = Var.queryString.parse(query);
    var yuldash = params['yuldash'];
	sql.main("SELECT russianName FROM towns;", function(error, rows) {
		var names = [];
		for(var it in rows)
			names.push(rows[it]["russianName"]);
		response.send(JSON.stringify(names));
	});
});

//Удаление участника из очереди.
Var.app.get('/dropFromQueue', function (request, response) {
	var query = Var.url.parse(request.url).query;
	var params = Var.queryString.parse(query);
	var human = params["human"];
	var id = params["id"] - 0;
	var direction = params["direction"] - 0;
    var time = params["time"] - 0;
    var date = params["date"] - 0;
    var logTime = new Date().toLocaleTimeString();
    console.log(logTime, "/dropFromQueue");
    console.log("\thuman: " + human + ", id: " + id + ", direction: " + direction + ", time: " + time + ", date: " + date); 
    //Проверки на дурака
    if (human != "driver" && human != "passenger") {
        console.log("\thuman is driver or passenger");
        response.send("unknown human");
        return;
    }

    if (isNaN(time) || time < 0 || time > 8) {
        console.log("\ttime is not a number or incorrect");
        response.send("unknown time");
        return;
    }
    if (isNaN(date) || date < 0) {
        console.log("\tdate is not a number or incorrect");
        response.send("unknown date");
        return;
    }
    if (isNaN(id)) {
        console.log("\tid is not a number");
        response.send("no id was sent");
        return;
    }
    
    sql.main("SELECT id FROM " + human + " WHERE id = " + id + ";", function (error, rows) {
        if (rows[0] == undefined) {
            console.log("\tno such user");
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
                    console.log("\tsuccess removed, he was only in queue");
                    response.send("success");
                    return;
                }
                
                //Пассажира нету в очереди. Видимо, уже нету. Нужно проверить
                //Теперь надо отправиться на server.met
                //Тут уже просто так сделать DELETE не получится. Нужно смотреть, кого удаляем.
                //Вернуть товарища в очередь, вернуть место водителю
                sqlQuery = "SELECT id, id_driver, booked FROM met WHERE id_passenger = " + id + " AND id_direction = "
                     + direction + " AND id_time = " + time + " AND date = " + date + ";"
                sql.main(sqlQuery, function (error, rows) {
                    //здесь rows.length очень даже может быть равен нулю
                    if (rows.length == 0) {
                        console.log("\tpassenger was not in queue");
                        response.send("success");
                        return;
                    }
                    var id_driver = rows[0]["id_driver"];
                    var bookedMet = rows[0]["booked"];
                    console.log("\tid_driver: " + id_driver + ", booked in met: " + bookedMet);
                    //Всё ок. пока всё хорошо
                    //Вернем места водителю
                    var sqlString = "INSERT INTO qdriver(id_driver, id_direction, id_time, date, seats) VALUES(" + id_driver + ", " 
                        + direction + ", " + time + ", " + date + ", " + bookedMet + ") " + 
                        "ON DUPLICATE KEY UPDATE seats = seats + " + bookedMet + ";";
                    sql.main(sqlString, function (error, rows) {
                        if (error)
                            console.log("\tError on adding seats to driver:" + error);
                        else
                            console.log("\tsucces adding seats to driver");
                    });
                    //Выкинем пассажира из очереди, пусть выбирает другой, заново встает.
                    sql.main("DELETE FROM met WHERE id_driver = " + id_driver + " AND id_passenger = " + id + 
                        " AND id_direction = " + direction + " AND id_time = " + time + " AND date = " + date + ";", 
                        function (error, rows) {
                            if (error)
                                console.log("\terror with deleting passenger from queue: " + error);
                            else {
                                console.log("\tsuccess removed passenger from queue");
                                response.send("success");
                            }
                    });
                });
            });
        } else {
            //Если водитель, то мы можем снять с очереди только в том случае, если у него э?э
            //По факту снимаем только с очереди, сколько он получил в met, столько при нем останется
            var sqlStr = "DELETE FROM qdriver WHERE id_driver = " + id + " AND id_direction = " + 
						direction + " AND id_time = " + time + " AND date = " + date + ";";
	    
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
    var logTime = new Date().toLocaleTimeString();
    console.log(logTime, "/queueStatus");
    console.log("\thuman: " + human + ", id: " + id + ", direction: " + ", time: " + time + ", date: " + date);
    //Проверка на дурака
    if (human != "driver" && human != "passenger") {
        console.log("\tincorrect human");
        response.send("error: incorrect human");
        return;
    }

    if (isNaN(time) || time > 8 || time < 0) {
        console.log("\tunknown time");
        response.send("unknown time");
        return;
    }
    if (isNaN(date) || date < 0) {
        console.log("\tincorrect date");
        response.send("incorrect form of date");
        return;
    }
    if (isNaN(direction) || direction < Var.directionMin || direction > Var.directionMax) {
        console.log("\tunknown direction");
        response.send("unknown direction" + JSON.stringify(params["direction"]));
        return;
    }

    //Проверка из базы данных. Ищем такого юзера из зарегестрированных
    sql.main("SELECT id FROM " + human + " WHERE id = " + id + ";", function (error, rows) {
        if (error) {
            console.log("\tthis user is not registred" + error);
            response.send("no such user");
            return;
        }
        
        //Хорошее место для оптимизации. Я делаю 1 лишний запрос в БД.
        //проверяем таблицы очереди и встреч, ищем нашего юзера. Встал ли он в очередь
		sql.main("SELECT id FROM q" + human + " WHERE id_" + human + " = " + id + " AND id_direction = " + direction + " AND id_time = " +
			time + " AND date = " + date + " UNION SELECT id FROM met WHERE id_" + human + " = " + id + " AND id_direction = " + direction + 
			" AND id_time = " + time + " AND date = " + date + ";", function(error, rows) {
            if (error) {
                console.log("\tuser not found in queue or met. error: " + error);
                response.send(error);
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
                    console.log("\tsuccess");
					response.end();
				});
			});
		});
    });
});

//запуск обработчика очереди в ручном режиме
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
