var Var = require('./variables.js');
var sql = require('./sql.js');
var queue = require('./makeQueue.js');

//Регистрация водителя, пассажира
Var.app.post('/registration', function(request, response) {
	var body = request.body;
	
	var name = body['name'];
	var phone = body['phone'];
	var human = body['human'];
	
	if(human == 'driver') {
		sql.main('insert into `driver`(`name`, `phone`, `access`) values ("' + name +
			'", "' + phone + '", 1);', function (error, rows) { 
				
				response.send(JSON.stringify(rows.insertId));
		//обновление массива водителей
		Var.driver[rows.insertId] = 1;
			});
		return;
	}
	if(human == 'passenger') {
		sql.main('insert into `passenger`(`name`, `phone`) values ("' + name + 
			'", "' + phone + '");', function (error, rows) {
				
				response.send(JSON.stringify(rows.insertId));
		//обновление массива пассажиров
		Var.passenger[rows.insertId] = 1;
			});
		return;
	}
	response.send("not added");
});

//По этим адресам должно приходить запросы на добавление в очередь.

Var.app.post('/qdriver', function(request, response) {
	var body = request.body;
	var id = body["id"];
	var seats = body["seats"];
	var time = body["time"];
	var direction = body["direction"];
	
	
	//обработка ошибок
	if(Var.qDriver[direction] == undefined){
		response.send("unknown direction");
		return;
	}
	if(Var.qDriver[direction][time]	== undefined) {
		response.send("unknown time");
		return;
	}
	if(seats == undefined)	{
		response.send("undefined number of seats");
		return;
	}
	sql.main("select id from driver where id = " + id + ";", function(error, rows) {
        if (rows[0] == undefined) {
            console.log("there is no such user");
            response.send("there is no such user");
            return;
        }
		var driver_in_queue = {
			"id": 0,
			"seats": 0,
			"passengersNumbers": []		//Номера всех пассажиров
		}
		driver_in_queue["id"] = id;
		driver_in_queue["seats"] = seats;
		 
		Var.qDriver[direction][time].push(driver_in_queue);
        sql.main('insert into `qdriver`(`id_driver`, `id_time`, `id_direction`, `seats`) values(' 
                + id + ',' + time + ',' + direction + ',' + seats + ');', function (error, rows){
            if (error) {
                console.log("there is an error with adding passenger to queue");
                response.send("error with adding driver to queue");
                return;
            }
            response.send("success added to Queue");
            queue.find();
        });
		
	});	
});

Var.app.post('/qpassenger', function(request, response) {
	
	var body = request.body;
	var id = body["id"];
	var booked = body["booked"];
	var time = body["time"];
	var direction = body["direction"];
	
	if(Var.qPassenger[direction] == undefined){
		response.send("unknown direction");
		return;
	}
	if(Var.qPassenger[direction][time]	== undefined) {
		response.send("unknown time");
		return;
	}
	if(booked < 0 || booked > 6){
		response.send("incorrect form of booked");
		return;
	}
	sql.main("select id from passenger where id = " + id + ";", function(error, rows){
		if(rows[0] === undefined)
		{
			console.log("there is no such user");
			response.send("there is no such user");
			return;
		}
		var passenger_in_queue = {
		"id": 0,
		"booked": 0,
		"driversNumber": 0		//это то, что потом будем заполнять
		}
		
		passenger_in_queue["id"] = id;
		passenger_in_queue["booked"] = booked;
		
		Var.qPassenger[direction][time].push(passenger_in_queue);
        sql.main('insert into `qpassenger`(`id_passenger`, `id_time`, `id_direction`, `booked`) values(' +
            id + ',' + time + ',' + direction + ',' + booked + ');', function (error, rows){
            if (error) {
                console.log("there is an error with adding passenger to queue");
                response.send("error with adding passenger to queue");
                return;
            }
            response.send("success added to Queue");
            queue.find();
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
	sql.main('insert into direction(id_source, id_destination) values("' + source + '", "' + destination + '");', function(error, rows) {
		if(error){
			console.log("Error was aquired", error);
			response.send("Error was aquired" + JSON.stringify(error));
			return;
		}
		response.send(rows);
	});
	
});
//