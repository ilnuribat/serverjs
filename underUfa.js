var Var = require('./variables.js');
var sql = require('./sql.js');

Var.app.get('/driversList', function (request, response) {
    var query = Var.url.parse(request.url).query;
    var params = Var.queryString.parse(query);
    var direction = params["direction"];
    var date = params["date"];

});