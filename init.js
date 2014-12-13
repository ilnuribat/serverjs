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
});
