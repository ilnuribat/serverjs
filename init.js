var Var = require('./variables.js');
var sql = require('./sql.js');

sql.main("SELECT MAX(id) AS 'max', MIN(id) AS 'min' FROM direction;", function (error, rows) {
    Var.directionMax = rows[0]["max"];
    Var.directionMin = rows[0]["min"];
});