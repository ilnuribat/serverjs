var Var = require('./variables.js');

//встречаем людей
function find_queue() {
  setTimeout(find_queue, 5000);
  
  //Цикл по временам - на каждом интервале по 2 очереди: пассажиры и водители
  //всего 8 интервалов времени с 00:00 - 03:00, 03:00 - 06:00, и т.д с шагом в 3 часа
  for(var TIME in Var.time) {
  
    //Если в очереди никого нет
    if(Var.qDriver[TIME].length + Var.qPassanger[TIME].length == 0) {
      console.log("empty hour: " + TIME);
    } else console.log(Var.qDriver[TIME].length + Var.qPassanger[TIME].length);
    
    //Цикл по всем Пассажирам
    for(var iPass = 0; iPass < Var.qPassanger[TIME].length; iPass ++) {
      var booked = Var.qPassanger[TIME][iPass]["booked"];   //Сколько мест забронировать
      var passangerID = Var.qPassanger[TIME][iPass]["id"];  //Телефонный номер пассажира
      
      if(booked > 0) {
        //Цикл по всем водителям
        for(var iDrive = 0; iDrive < Var.qDriver[TIME].length; iDrive++) {
          var driverID = Var.qDriver[TIME][iDrive]["id"];       //Телефонный номер водителя
          var driverSeats = Var.qDriver[TIME][iDrive]["seats"]; //Сколько свободных мест имеется у водителя
          
          if(booked <= driverSeats) { // можно посадить пассажира на эту машину
            for(var BOOKEDiter = 0; BOOKEDiter < booked; BOOKEDiter ++)   
            //Даем номера пассажиров водителю
              Var.qDriver[TIME][iDrive]["passangersNumbers"].push(passangerID);
            
            //Место, куда посылаем встретившихся
            Var.met[TIME].push({id: passangerID, driversPhone: driverID});
            
            //Уменьшаем количество свободных мест в машине. Пассажира снимаем с очереди
            Var.qDriver[TIME][iDrive]["seats"] = Var.qDriver[TIME][iDrive]["seats"] - booked;   
            Var.qPassanger[TIME][iPass]["booked"] = 0;
            
          }
          
          
          
          console.log(Var.met[TIME]);
          Var.qPassanger[TIME][iPass]["driversNumber"] = driverID;     //Даем номер водителя пассажиру
          
          if(Var.qDriver[TIME][iDrive]["seats"] == 0){
            Var.qDriver[TIME].splice(iDrive, 1);
          }
        }
      } else {
        Var.qPassanger[TIME].splice(iPass, 1);
      }
    }
    
  }

  
}

exports.find = find_queue();
