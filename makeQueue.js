var Var = require('./variables.js');

function find_queue() {
//встречаем людей
  //Цикл по всем Пассажирам 
  setTimeout(find_queue, 5000);
  if(Var.qDriver.length * Var.qPassanger.length == 0) {
    console.log("nothing to do");
    return;
  }
  for(var iPass = 0; iPass < Var.qPassanger.length; iPass ++) {
    var booked = Var.qPassanger[iPass]["booked"];   //Сколько мест забронировано
    var passangerID = Var.qPassanger[iPass]["id"];  //Телефонный номер пассажира
    //Цикл по всем водителям
    for(var iDrive = 0; iDrive < Var.qDriver.length; iDrive++) {
      console.log("qDriver's length = " + Var.qDriver.length);
      var driverID = Var.qDriver[iDrive]["id"];       //Телефонный номер водителя
      var driverSeats = Var.qDriver[iDrive]["seats"]; //Сколько свободных мест имеется у водителя
      
      if(booked <= driverSeats) { // можно посадить пассажира на эту машину
        for(var BOOKEDiter = 0; BOOKEDiter < booked; BOOKEDiter ++)   //Даем номера пассажиров водителю
          Var.qDriver[iDrive]["phone_numbers"].push(passangerID);
        Var.met.push({id: passangerID, driversPhone: driverID});      //Следующий этап: в это переменной
        //Будут храниться те, которые уже "встретились". Затем это удалиться
        //Нужно будет вести логи
      }
      
      Var.qDriver[iDrive]["seats"] = Var.qDriver[iDrive]["seats"] - booked;   //Уменьшаем количество
      //свободных мест в машине
      console.log(Var.met);
      Var.qPassanger[iPass]["phone_number"] = driverID;     //Даем номер водителя пассажиру
      if(Var.qDriver[iDrive]["seats"] == 0){
        console.log("Deleting driver from queue");
        Var.qDriver.slice(iDrive, 1);
      }
    }
  }
}

exports.find = find_queue();
