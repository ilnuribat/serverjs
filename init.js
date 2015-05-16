var Var = require('./variables.js');
var sql = require('./sql.js');

sql.main("SELECT COUNT(id) AS 'count' FROM direction;", function (error, rows) {
    Var.directionSize = rows[0]["count"];
	console.log(Var.directionSize, ": direction size");
});