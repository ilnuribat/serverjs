var Var = require('./variables.js');

function findQueue() {//находим в очереди совпадения, так скажем
  console.log("findQueue started");
  for(var i = 0; i < Var.QPassanger.lenght; i++){
    var booked = Var.QPassanger[i]["booked"];
    console.log("id ", i, "with booked ", booked, " seats");
  }
  setTimeout(findQueue, 1000);
}
