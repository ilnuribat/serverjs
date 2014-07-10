var Var = require('./variables.js');
var queue = require('./makeQueue.js');

var Post = Var.app.post('/post', function(request, response) {
  var hData = request.body;
  var Time = hData["time"];
  var human = hData["human"];
  var successPost = 0;
  if(Time == 0 || Time == 3 || Time == 6 || Time == 9 ||
    Time == 12 || Time == 15 || Time == 18 || Time == 21) {
    if(human == "passanger_count" || human == "driver_count") {
      Var.data[Time][human] ++;
      successPost = 1;
    }
    Var.data[Time]["success_count"] ++;
  }
  if(successPost == 1) {
    console.log(Var.data);
    response.send("server: data recieved");
  }
  else 
    response.send("server: wrong DATA type");
});

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