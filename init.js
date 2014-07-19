var Var = require('./variables.js');
var sql = require('./sql.js');

var direction = sql.main("select count(id) from direction", function (error, rows) {
    if(error) {console.log("error found!"); exit();} 
    var directionSize = rows[0]['count(id)'];
    for(var i = 1; i <= directionSize; i ++) {
      Var.qDriver[i] = {"0":  [],  "3":  [],  "6":  [],  "9":  [],  "12": [],  "15": [],  "18": [],  "21": [] };
      Var.qPassanger[i] = {"0":  [],  "3":  [],  "6":  [],  "9":  [],  "12": [],  "15": [],  "18": [],  "21": [] };
      Var.met[i] = {"0":  [],  "3":  [],  "6":  [],  "9":  [],  "12": [],  "15": [],  "18": [],  "21": [] };
    }
  });

exports.direction = direction;