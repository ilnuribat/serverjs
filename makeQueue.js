var Var = require('./variables.js');

var findQueue = function find_queue() {//находим в очереди совпадения, так скажем
  console.log("findQueue started");
  for(var i = 0; i < Var.qPassanger.lenght; i++){
    var booked = Var.qPassanger[i]["booked"];
    console.log("id ", i, "with booked ", booked, " seats");
  }
  setTimeout(find_queue, 1000);
}

exports.findQueue = findQueue;
