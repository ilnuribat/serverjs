var Var = require('./variables.js');
var sql = require('./sql.js');
var queue = require('./makeQueue.js');

//Регистрация водителя, пассажира
//На будущее: проверить номера. Номер должен быт 9-значным. Не должен совпадать в базе
Var.app.post('/registration', function(request, response) {
    var body = request.body;
    console.log(body);
	var name = body['name'];
	var phone = body['phone'];
	var human = body['human'];
    console.log("register:", name, phone, human);
    if (phone.length != 11) {
        console.log("phone number is not 11-symbols");
        response.send("phone number is not 11-symbols");
        return;
    }
    
    if (name.length == 0) {
        console.log("name is NULL");
        response.send("name is NULL");
        return;
    }
	
    if (human == 'driver' || human == 'passenger') {
        sql.main('INSERT INTO ' + human + '(name, phone) VALUES ("' + name + '", "' + phone + 
                '") ON DUPLICATE KEY UPDATE name = VALUES(name);', function (error, rows) {
            sql.main("SELECT id FROM " + human + " WHERE phone = " + phone + ";", function (error, rows) {
                console.log("\t\tID: ", rows[0]["id"]);
                if (error) {
                    console.log(error);
                    response.send(JSON.stringify(error));
                    return;
                }
                response.send(JSON.stringify(rows[0]["id"]));
            });
        });
        return;
    }
	response.send("not added");
});

//Встать в очередь
Var.app.post('/qdriver', function(request, response) {
	var body = request.body;
	var id = body["id"] - 0;
	var seats = body["seats"] - 0;
	var time = body["time"] - 0;
    var direction = body["direction"] - 0;
    var date = body["date"];
	console.log(new Date().getTime(), ": qdriverId: " + id + ",\ttime: " + time + ",\tdirection: " + direction + "seats:" + seats);
    //обработка ошибок
    //Проверка направления
    if (direction < Var.directionMin || direction > Var.directionMax) {
        console.log("\tunknown direction");
		response.send("\tunknown direction");
		return;
    }
    
    //Проверка Времени
    if (time < 0 || time > 8) {
        console.log("\tunknown time");
		response.send("unknown time");
		return;
    }
    
    //Проверка количества мест
    if (seats < 0 || seats > 4) {
        console.log("\tunknown seats");
		response.send("unknown number of seats");
		return;
    }
    if (date < 0) {
        console.log("\tincorrect form of date");
        response.send("incorrect form of date");
        return;
    }
	sql.main("SELECT id FROM driver WHERE id = " + id + ";", function(error, rows) {
        if (rows[0] == undefined) {
            console.log("\tno such user", id);
            response.send("error 404: userID");
            return;
        }
		
        sql.main('INSERT INTO qdriver(id_driver, id_time, id_direction, seats, date) VALUES(' 
                + id + ',' + time + ',' + direction + ',' + seats + ', ' + date + ');', function (error, rows) {
            if (error) {
                console.log("\t\t", error);
                response.send("error with adding driver to queue");
                return;
            }
            response.send("success added to Queue");
            console.log("\t\tuser was added to Queue(id, time, direction, seats, date): ", id, time, direction, seats, date);
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
    var logTime = new Date().toLocaleTimeString();
    var human = body["human"];
    console.log(logTime, ":: qpassengerId: " + id + ",\ttime: " + time + ",\tdirection: " + direction + ",\tbooked:" + booked);
    //Проверка ошибок
    //Проверка направления
    if (isNaN(direction) || direction < Var.directionMin || direction > Var.directionMax) {
        console.log("\tunknown direction");
        response.send("unknown direction");
        return;
    }
    //Проверка Времени
    if (isNaN(time) || time < 0 || time > 8) {
        console.log("\tincorrect number of time");
        response.send("incorrect number of time");
        return;
    }

    if (isNaN(booked) || booked < 0 || booked > 4) {
        console.log("\tincorrect number of booked");
		response.send("incorrect number of booked");
		return;
    }
    if (isNaN(date) || date < 0) {
        console.log("\tincorrect number of date");
        response.send("incorrect numberof date");
        return;
    }
	sql.main("SELECT id FROM passenger WHERE id = " + id + ";", function(error, rows){
		if(rows[0] === undefined)
		{
            console.lsog(":\tno such user", id);
            response.send("error 404: userID");
            return;
		}
        var sqlQuery = 'INSERT INTO `qpassenger`(`id_passenger`, `id_time`, `id_direction`, `booked`, `date`) VALUES(' +
            id + ',' + time + ',' + direction + ',' + booked + ', ' + date + ') ON DUPLICATE KEY UPDATE booked = VALUES(booked);';
        sql.main(sqlQuery, function (error, rows){
                if (error) {
                    console.log(":\t:\tDuplicate key? :\t", error);
                    response.send("error with adding driver to queue");
                    return;
                }
                response.send("success added to Queue");
                console.log(":\t:\tuser was added to Queue(id, time, direction, seats, date): ", id, time, direction, booked, date);
        });
	});	
});