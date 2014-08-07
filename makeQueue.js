var Var = require('./variables.js');
var sql = require('./sql.js');
/*
* Идем циклом по всем направлениям, затем по всем временным сегментам
* Затем по всем пассажирам, которые ещё что-то бронировали, затем по всем водителям, у которых ещё есть места
*/

//встречаем людей
function find_queue() {
  setTimeout(find_queue, 5000);
  
  //Цикл по всем направлениям.
  for(var direction = 1; direction <= Var.directionSize; direction ++){
    //Цикл по временам - на каждом интервале по 2 очереди: пассажиры и водители
    //всего 8 интервалов времени с 00:00 - 03:00, 03:00 - 06:00, и т.д с шагом в 3 часа
    for(var TIME = 1; TIME <= 8; TIME ++){
    
      //Если в очереди никого нет
      if(Var.qDriver[direction][TIME].length * Var.qPassanger[direction][TIME].length == 0) {
      } else console.log("time: ", TIME, " direction: ", direction, " queue's size: ", Var.qDriver[direction][TIME].length + Var.qPassanger[direction][TIME].length);
      
      //Цикл по всем Пассажирам
      for(var iPass = 0; iPass < Var.qPassanger[direction][TIME].length; iPass ++) {
        var booked = Var.qPassanger[direction][TIME][iPass]["booked"];   //Сколько мест забронировать
        var passangerID = Var.qPassanger[direction][TIME][iPass]["id"];  //ID пассажира
        
        if(booked > 0) {
          //Цикл по всем водителям
          for(var iDrive = 0; iDrive < Var.qDriver[direction][TIME].length; iDrive++) {
            var driverID = Var.qDriver[direction][TIME][iDrive]["id"];       //ID водителя
            var driverSeats = Var.qDriver[direction][TIME][iDrive]["seats"]; //Сколько свободных мест имеется у водителя
            
            if(booked <= driverSeats) { // можно посадить пассажира на эту машину
              for(var BOOKEDiter = 0; BOOKEDiter < booked; BOOKEDiter ++)
              //Даем номера пассажиров водителю
                Var.qDriver[direction][TIME][iDrive]["passangersNumbers"].push(passangerID);
              
              //Место, куда посылаем встретившихся
              Var.met[direction][TIME].push({id: passangerID, driversPhone: driverID});
              
              //Уменьшаем количество свободных мест в машине. Пассажира снимаем с очереди
              Var.qDriver[direction][TIME][iDrive]["seats"] = Var.qDriver[direction][TIME][iDrive]["seats"] - booked;
              Var.qPassanger[direction][TIME][iPass]["booked"] = 0;
              
            }
            //console.log(Var.met[direction][TIME]);
            Var.qPassanger[direction][TIME][iPass]["driversNumber"] = driverID;     //Даем номер водителя пассажиру
            
            if(Var.qDriver[direction][TIME][iDrive]["seats"] == 0){
              Var.met[direction][TIME].push({id: driverID, passangersNumbers: Var.qDriver[direction][TIME][iDrive]["passangersNumbers"]});
              sql.main("delete from qdriver where id_driver = " + driverID + ';', function(error, rows){});
              Var.qDriver[direction][TIME].splice(iDrive, 1);
            }
          }
        } else {
          sql.main("delete from qpassanger where id_passanger = " + passangerID + ';', function(error, rows){});
          Var.qPassanger[direction][TIME].splice(iPass, 1);
         // console.log("passanger removed from queue");
        }
      }
      
    }

  }  
}
