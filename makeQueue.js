var Var = require('./variables.js');

function find_queue() {
//встречаем людей
  for(rowPassanger in Var.qPassanger){
    var booked = Var.qPassanger[rowPassanger]["booked"];
    var passangerID = Var.qPassanger[rowPassanger]["id"];
    for(rowDriver in Var.qDriver) {
      var driverID = Var.qDriver[rowDriver]["id"];
      var driverSeats = Var.qDriver[rowDriver]["seats"];
      if(booked <= driverSeats) { // можно посадить пассажира на эту машину
        for(var BOOKEDiter = 0; BOOKEDiter < booked; BOOKEDiter ++)
          Var.qDriver[rowDriver]["phone_numbers"].push(passangerID);
        Var.qDriver[rowDriver]["seats"] = Var.qDriver[rowDriver]["seats"] - booked;
	//Снимаем с очереди водителя, если у него не осталось мест
	//if(Var.qDriver[rowDriver]["seats"] == 0)
	  //delete Var.qDriver[rowDriver];
	//Так же мы смогли посадить пассажира, его тоже снимаем с очереди
	//delete Var.qPassanger[rowPassanger];
        Var.qPassanger[rowPassanger]["phone_number"] = driverID;
      }      
    }
  }
  setTimeout(find_queue, 5000);
}

exports.find = find_queue();
