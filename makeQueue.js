var Var = require('./variables.js');
var sql = require('./sql.js');
/*
* Идем циклом по всем направлениям, затем по всем временным сегментам
* Затем по всем пассажирам, которые ещё что-то бронировали, затем по всем водителям, у которых ещё есть места
*/

//встречаем людей
var find = function find_queue() {
  //setTimeout(find_queue, 5000);
  console.log("makeQueue");
  //Цикл по всем направлениям.
  for(var direction = 1; direction <= Var.directionSize; direction ++){
    //Цикл по временам - на каждом интервале по 2 очереди: пассажиры и водители
    //всего 8 интервалов времени с 00:00 - 03:00, 03:00 - 06:00, и т.д с шагом в 3 часа
    for(var TIME = 1; TIME <= 8; TIME ++){
    
      //Если в очереди никого нет
      if(Var.qDriver[direction][TIME].length * Var.qPassenger[direction][TIME].length == 0) {
      } else console.log("time: ", TIME, " direction: ", direction, " queue's size: ", Var.qDriver[direction][TIME].length + Var.qPassenger[direction][TIME].length);
      
      //Цикл по всем Пассажирам
      for(var iPass = 0; iPass < Var.qPassenger[direction][TIME].length; iPass ++) {
        var booked = Var.qPassenger[direction][TIME][iPass]["booked"];   //Сколько мест забронировать
        var passengerID = Var.qPassenger[direction][TIME][iPass]["id"];  //ID пассажира
        
        if(booked > 0) {
          //Цикл по всем водителям
          for(var iDrive = 0; iDrive < Var.qDriver[direction][TIME].length; iDrive++) {
            var driverID = Var.qDriver[direction][TIME][iDrive]["id"];       //ID водителя
            var driverSeats = Var.qDriver[direction][TIME][iDrive]["seats"]; //Сколько свободных мест имеется у водителя
            
            if(booked <= driverSeats) { // можно посадить пассажира на эту машину
              for(var BOOKEDiter = 0; BOOKEDiter < booked; BOOKEDiter ++)
              //Даем номера пассажиров водителю
                Var.qDriver[direction][TIME][iDrive]["passengersNumbers"].push(passengerID);
              
              //Место, куда посылаем встретившихся
              Var.met[direction][TIME].push({id: passengerID, driversPhone: driverID});
			  sql.main("insert into met(id_driver, id_passenger, id_direction, id_time) \
				values(" + driverID + ", " + passengerID + ", " + direction + ", " + TIME + ");", function(error, rows){});
              
              //Уменьшаем количество свободных мест в машине. Пассажира снимаем с очереди
              Var.qDriver[direction][TIME][iDrive]["seats"] = Var.qDriver[direction][TIME][iDrive]["seats"] - booked;
              Var.qPassenger[direction][TIME][iPass]["booked"] = 0;
              
            }
            //console.log(Var.met[direction][TIME]);
            Var.qPassenger[direction][TIME][iPass]["driversNumber"] = driverID;     //Даем номер водителя пассажиру
            
            if(Var.qDriver[direction][TIME][iDrive]["seats"] == 0){
              Var.met[direction][TIME].push({id: driverID, passengersNumbers: Var.qDriver[direction][TIME][iDrive]["passengersNumbers"]});
              sql.main("delete from qdriver where id_driver = " + driverID + ';', function(error, rows){});
              Var.qDriver[direction][TIME].splice(iDrive, 1);
            }
          }
        } else {
          sql.main("delete from qpassenger where id_passenger = " + passengerID + ';', function(error, rows){});
          Var.qPassenger[direction][TIME].splice(iPass, 1);
         // console.log("passenger removed from queue");
        }
      }
      
    }

  }  
}

exports.find = find;