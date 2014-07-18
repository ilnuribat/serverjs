var Var = require('./variables.js');
var queue = require('./makeQueue.js');
var sql = require('./sql.js');

//Регистрация водителя, пассажира
var registration = Var.app.post('/registration', function(request, response) {
  var body = request.body;
  var name = body['name'];
  var phone = body['phone'];
  var human = body['human'];
  if(human == 'driver') {
    sql.main('insert into `driver`(`name`, `phone`, `access`) values ("' + name + '", "' + phone + '", 1);', function (error, rows) { });
    response.send('success registration');
  }
  if(human == 'passanger') {
    sql.main('insert into `passanger`(`name`, `phone`) values ("' + name + '", "' + phone + '");', function (error, rows) {console.log(error + '\n' + rows) });
    response.send('success registration');
  }
});

//По этому адресу должно прийти запрос на добавление в очередь.
var qDriver = Var.app.post('/qdriver', function(request, response) {
  var body = request.body;
  var id = body["id"];
  var seats = body["seats"];
  var time = body["time"];
  
  //обработка ошибки: время должно быть введено в запросе
  if(Var.time[time] != "yes") {
    console.log("wrong data type: time format is not correct or doesn't exist");
    return ;
  }
  
  var driver_in_queue = {
    "id": 0,
    "seats": 0,
    "time": 0,
    "passangersNumbers": []		//Номера всех пассажиров
  }

  driver_in_queue["id"] = id;
  driver_in_queue["seats"] = seats;
  driver_in_queue["time"] = time;
  
  Var.qDriver[time].push(driver_in_queue);
  response.send(Var.qDriver[time]);
});

var qPassanger = Var.app.post('/qpassanger', function(request, response) {
  var body = request.body;
  var id = body["id"];
  var booked = body["booked"];
  var time = body["time"];
  
  if(Var.time[time] != "yes") {
    console.log("wrong data type: time format is not correct or doesn't exist");
    return ;
  }
  
  var passanger_in_queue = {
    "id": 0,
    "booked": 0,
    "time": 0,
    "driversNumber": 0		//это то, что потом будем заполнять
  }
  
  passanger_in_queue["id"] = id;
  passanger_in_queue["booked"] = booked;
  passanger_in_queue["time"] = time;
  
  Var.qPassanger[time].push(passanger_in_queue);
  response.send(Var.qPassanger[time]);

});

exports.qDriver = qDriver;
exports.qPassanger = qPassanger;
exports.registration = registration;