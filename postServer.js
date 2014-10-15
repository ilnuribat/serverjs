var Var = require('./variables.js');
var sql = require('./sql.js');

//Регистрация водителя, пассажира
Var.app.post('/registration', function(request, response) {
  var body = request.body;
  console.log(body);
  var name = body['name'];
  var phone = body['phone'];
  var human = body['human'];
  console.log("registration:");
  if(human == 'driver') {
    sql.main('insert into `driver`(`name`, `phone`, `access`) values ("' + name +
      '", "' + phone + '", 1);', function (error, rows) { 
        console.log(rows);
        response.send(JSON.stringify(rows.insertId));
		//обновление массива водителей
		Var.driver[rows.insertId] = 1;
      });
    return;
  }
  if(human == 'passanger') {
    sql.main('insert into `passanger`(`name`, `phone`) values ("' + name + 
      '", "' + phone + '");', function (error, rows) {
        console.log(rows);
        response.send(JSON.stringify(rows.insertId));
		//обновление массива пассажиров
		Var.passanger[rows.insertId] = 1;
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
  console.log(body);
  
  //обработка ошибок
  if(Var.qDriver[direction] == undefined){
    response.send("100");
    return;
  }
  if(Var.qDriver[direction][time]  == undefined) {
    response.send("101");
    return;
  }
  
  if(Var.driver[id] != 1) {
    response.send("102: There is no such user");
    return;
  }
  
  var driver_in_queue = {
    "id": 0,
    "seats": 0,
    "passangersNumbers": []		//Номера всех пассажиров
  }
  driver_in_queue["id"] = id;
  driver_in_queue["seats"] = seats;
 
  Var.qDriver[direction][time].push(driver_in_queue);
  sql.main('insert into `qdriver`(`id_driver`, `id_time`, `id_direction`, `seats`) values(' + id + ',' + time + ',' + direction + ',' + seats +');', function(error, rows){});
  response.send(JSON.stringify(Var.qDriver[direction][time]));
});

Var.app.post('/qpassanger', function(request, response) {
  
  var body = request.body;
  console.log(body);
  var id = body["id"];
  var booked = body["booked"];
  var time = body["time"];
  var direction = body["direction"];
  
   if(Var.qPassanger[direction] == undefined){
    response.send("100");
    return;
  }
  if(Var.qPassanger[direction][time]  == undefined) {
    response.send("101");
    return;
  }
  /*
  if(Var.passanger[id] != 1) {
    response.send("102: There is no such user");
    return;
  }
  */
  if(booked < 0 || booked > 6){
    response.send("error 104: incorrect form of booked");
    return;
  }
  
  var passanger_in_queue = {
    "id": 0,
    "booked": 0,
    "driversNumber": 0		//это то, что потом будем заполнять
  }
  
  passanger_in_queue["id"] = id;
  passanger_in_queue["booked"] = booked;
  
  Var.qPassanger[direction][time].push(passanger_in_queue);
   sql.main('insert into `qpassanger`(`id_passanger`, `id_time`, `id_direction`, `booked`) values(' + id + ',' + time + ',' + direction + ',' + booked+');', function(error, rows){});
  response.send(Var.qPassanger[direction][time]);
});

Var.app.post('/newTown', function(request, response) {
	var body = request.body;
	var name = body["name"];
	var russianName = body["russianName"];
	sql.main('INSERT INTO `towns` (`name`, `russianName`) VALUES("' + name +  '", "' + russianName + '");', function(error, rows) {
		console.log(error);
		console.log("adding towns ", rows);
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
