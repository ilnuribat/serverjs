var Var = require('./variables.js');
var get = require('./getServer.js');
var post = require('./postServer.js');

//Var.app.use(Var.bodyParser.urlencoded());

//Var.app.post('/post', function(request, response) {
//  var hData = request.body;
//  console.log(request.connection.remoteAddress);
//  var Time = hData["time"];
//  var human = hData["human"];
//  
//  Var.data[Time]["success_count"]++;
//  if(human == "passanger_count" || human == "driver_count")
//    Var.data[Time][human]++;
//  console.log(Var.data);
//  response.send("server:data recieved");
//});

get.Data;
get.Get;
get.Cities;

post.Post;

Var.app.listen(80);

console.log("Server started");
