var Var = require('./variables.js');

function find_queue() {
//встречаем людей
  setTimeout(find_queue, 5000);
  
  //Если в очереди никого нет
  if(Var.qDriver.length * Var.qPassanger.length == 0) {
    //console.log("nothing to do");
    return;
  }
  
  //Цикл по всем Пассажирам
  for(var iPass = 0; iPass < Var.qPassanger.length; iPass ++) {
    var booked = Var.qPassanger[iPass]["booked"];   //Сколько мест забронировать
    var passangerID = Var.qPassanger[iPass]["id"];  //Телефонный номер пассажира
    if(booked > 0) {
      //Цикл по всем водителям
      for(var iDrive = 0; iDrive < Var.qDriver.length; iDrive++) {
        console.log("qDriver " + Var.qDriver.length + "qPassanger" + Var.qPassanger.length);
        var driverID = Var.qDriver[iDrive]["id"];       //Телефонный номер водителя
        var driverSeats = Var.qDriver[iDrive]["seats"]; //Сколько свободных мест имеется у водителя
        
        if(booked <= driverSeats) { // можно посадить пассажира на эту машину
          for(var BOOKEDiter = 0; BOOKEDiter < booked; BOOKEDiter ++)   //Даем номера пассажиров водителю
            Var.qDriver[iDrive]["passangersNumbers"].push(passangerID);
          Var.met.push({id: passangerID, driversPhone: driverID});
          Var.qDriver[iDrive]["seats"] = Var.qDriver[iDrive]["seats"] - booked;   //Уменьшаем количество
          //свободных мест в машине
          Var.qPassanger[iPass]["booked"] = 0;
          //Следующий этап: в это переменной
          //будут храниться те, которые уже "встретились". Затем это удалиться
          //нужно будет вести логи
        }
        
        
        
        console.log(Var.met);
        Var.qPassanger[iPass]["driversNumber"] = driverID;     //Даем номер водителя пассажиру
        if(Var.qDriver[iDrive]["seats"] == 0){
          console.log("Deleting driver from queue");
          Var.qDriver.slice(iDrive, 1);
        }
      }
    }
  }
}

exports.find = find_queue();
