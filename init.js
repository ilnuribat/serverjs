/*
*
* Здесь будем инициализировать данные, заполнять массивы с базы данных. 
* Актуально это делать после падения процесса нода, либо после вынужденной остановки процесса
* с целью исправить код, дополнить.
* Основная цель - научиться вытаскивать данные с БД в qDriver и qPassenger. Тогда можно забыть про потери данных.
*
*/
var Var = require('./variables.js');
var sql = require('./sql.js');

//Подготовка массива очередей. Создание, инициализация
sql.main("select count(id) from direction;", function (error, rows) {
	if(error) {console.log("error found!"); exit();}
		Var.directionSize = rows[0]['count(id)'];
	
		for(var i = 1; i <= Var.directionSize; i ++) {
			Var.qDriver[i] = [];
			Var.qPassenger[i] = [];
			for(var j = 0; j <= 8; j ++) {
				Var.qDriver[i][j] = [];
				Var.qPassenger[i][j] = [];
			}
    }
	//Восстановление очереди водителей. 
	sql.main("select * from qdriver;", function(error, rows) {
		if(rows[0] == null) 
		    return;
		for(row in rows) {
		    var qd = rows[row];
		    var direction = qd["id_direction"];
		    var time = qd["id_time"];
		    Var.qDriver[direction][time].push({"id": qd["id_driver"], "seats": qd["seats"]});
		}
	});

	//Восстановление очереди пассажиров
	sql.main("select * from qpassenger;", function(error, rows) {
		if(rows[0] == null) 
		    return;

		for(row in rows) {
            var qp = rows[row];
            var direction = qp["id_direction"];
            var time = qp["id_time"];
            var date = qp["date"];
		    Var.qPassenger[direction][time].push({"id": qp["id_passenger"], "booked": qp["booked"]});
		}
	});
	
});
