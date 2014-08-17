/*
*
* Здесь будем инициализировать данные, заполнять массивы с базы данных. 
* Актуально это делать после падения процесса нода, либо после вынужденной остановки процесса
* с целью исправить код, дополнить.
* Основная цель - научиться вытаскивать данные с БД в qDriver и qPassanger. Тогда можно забыть про потери данных.
*
*/
var Var = require('./variables.js');
var sql = require('./sql.js');

sql.main("select count(id) from direction;", function (error, rows) {
    //if(error) {console.log("error found!"); exit();}
    Var.directionSize = rows[0]['count(id)'];
    for(var i = 1; i <= Var.directionSize; i ++) {
      Var.qDriver[i] = [];
      Var.qPassanger[i] = [];
      Var.met[i] = [];
      for(j = 0; j <= 8; j ++) {
        Var.qDriver[i][j] = [];
        Var.qPassanger[i][j] = [];
        Var.met[i][j] = [];
      }
    }
});

sql.main("select  id from driver;", function(error, rows) {
  
  for(row in rows){
    Var.driver[rows[row]["id"]] = 1;
  }
});

sql.main("select id from passanger;", function(error, rows) {
  if(error) {console.log("error: init.js var driver");}
  for(row in rows) {
    Var.passanger[rows[row]["id"]] = 1;
  }
});

sql.main("select * from qdriver;", function(error, rows) {
  if(rows[0] == null) 
    return;
  for(row in rows) {
    var qd = rows[row];
    Var.qDriver[qd["id_direction"]][qd["id_time"]].push({"id": qd["id_driver"], "seats": qd["seats"], "passangersNumbers": []});
  }
});

sql.main("select * from qpassanger;", function(error, rows) {
  if(rows[0] == null) 
    return;

  for(row in rows) {
    var qp = rows[row];
    Var.qPassanger[qp["id_direction"]][qp["id_time"]].push({"id": qp["id_passanger"], "booked": qp["booked"], "driversNumber": qp["driversNumber"]});
  }
});