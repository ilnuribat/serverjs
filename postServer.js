var Var = require('./variables.js');
var sql = require('./sql.js');
var queue = require('./makeQueue.js');

//Регистрация водителя, пассажира
//На будущее: проверить номера. Номер должен быт 9-значным. Не должен совпадать в базе
Var.app.post('/registration', function(request, response) {
	var body = request.body;
	
	var name = body['name'];
	var phone = body['phone'];
	var human = body['human'];
	
	if(human == 'driver') {
		sql.main('INSERT INTO driver(name, phone,) VALUES ("' + name + '", "' + phone + '");', function (error, rows) { 
				
				response.send(JSON.stringify(rows.insertId));

			});
		return;
	}
	if(human == 'passenger') {
		sql.main('INSERT INTO passenger(name, phone) VALUES("' + name + '", "' + phone + '");', function (error, rows) {
				response.send(JSON.stringify(rows.insertId));
		        //обновление массива пассажиров
			});
		return;
	}
	response.send("not added");
});

//По этим адресам должно приходить запросы на добавление в очередь.

Var.app.post('/qdriver', function(request, response) {
	var body = request.body;
	var id = body["id"] - 0;
	var seats = body["seats"] - 0;
	var time = body["time"] - 0;
    var direction = body["direction "] - 0;
    
    //Отвечает за дату.
    var date = body["date"];
	
    //обработка ошибок
    //Проверка направления
	if(direction < 0 || direction > Var.directionSize){
		response.send("unknown direction");
		return;
    }
    
    //Проверка Времени
	if(time < 0 || time > 8) {
		response.send("unknown time");
		return;
    }
    
    //Проверка количества мест
	if(seats < 0 || seats > 8)	{
		response.send("unknown number of seats");
		return;
	}
	sql.main("SELECT id FROM driver WHERE id = " + id + ";", function(error, rows) {
        if (rows[0] == undefined) {
            console.log("there is no such user");
            response.send("there is no such user");
            return;
        }
		

        sql.main('INSERT INTO qdriver(id_driver, id_time, id_direction, seats, date) VALUES(' 
                + id + ',' + time + ',' + direction + ',' + seats + ', ' + date + ');', function (error, rows) {
            if (error) {
                console.log("there is an error with adding passenger to queue");
                response.send("error with adding driver to queue");
                return;
            }
            response.send("success added to Queue");
        });
	});	
});

Var.app.post('/qpassenger', function(request, response) {
	
	var body = request.body;
	var id = body["id"] - 0;
	var booked = body["booked"] - 0;
	var time = body["time"] - 0;
	var direction = body["direction"] - 0;
    
    var date = body["date"] - 0;
    //Проверка ошибок
    //Проверка направления
    if (direction < 0 || direction > Var.directionSize) {
        response.send("unknown direction");
        return;
    }
    //Проверка Времени
    if (time < 0 || time > 8) {
        response.send("unknown time");
        return;
    }

	if(booked < 0 || booked > 6){
		response.send("incorrect form of booked");
		return;
    }
    if (date < 0) {
        response.send("incorrect form of date");
        return;
    }
	sql.main("SELECT id FROM passenger WHERE id = " + id + ";", function(error, rows){
		if(rows[0] === undefined)
		{
			console.log("there is no such user");
			response.send("there is no such user");
			return;
		}
		
        sql.main('INSERT INTO `qpassenger`(`id_passenger`, `id_time`, `id_direction`, `booked`, `date`) VALUES(' +
            id + ',' + time + ',' + direction + ',' + booked + ', ' + date + ');', function (error, rows){
            if (error) {
                console.log("there is an error with adding passenger to queue");
                response.send("error with adding passenger to queue");
                return;
            }
            response.send("success added to Queue");
        });
	});	
});

Var.app.post('/newTown', function(request, response) {
	var body = request.body;
	var name = body["name"];
	var russianName = body["russianName"];
	sql.main('INSERT INTO `towns` (`name`, `russianName`) VALUES("' + name +	'", "' + russianName + '");', function(error, rows) {
		response.send(rows);
	});
});

Var.app.post('/newTime', function(request, response) {
	var body = request.body;
	var name = body["name"];
	sql.main('INSERT INTO `time` (`name`) VALUES("' + name + '");', function(error, rows) {
		if(error){
			console.log("Error was aquired", error);
			response.send("Error was aquired" + JSON.stringify(error));
			return;
		}
		response.send(rows);
	});
});

Var.app.post('/newDirection', function(request, response) {
	var body = request.body;
	var source = body["source"];
	var destination = body["destination"];
	sql.main('INSERT INTO direction(id_source, id_destination) VALUES("' + source + '", "' + destination + '");', function(error, rows) {
		if(error){
			console.log("Error was aquired", error);
			response.send("Error was aquired" + JSON.stringify(error));
			return;
		}
		response.send(rows);
	});
	
});
//