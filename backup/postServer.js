var Var = require('./variables.js');

var Post = Var.app.post('/post', function(request, response) {
  var hData = request.body;
  console.log("hello from postServer.js");
  console.log(request.ip);
  var Time = hData["time"];
  var human = hData["human"];
  var successPost = 0;
  if(Time == 0 || Time == 3 || Time == 6 || Time == 9 ||
    Time == 12 || Time == 15 || Time == 18 || Time == 21) {
    if(human == "passanger_count" || human == "driver_count") {
      Var.data[Time][human] ++;
      successPost = 1;
    }
    Var.data[Time]["success_count"] ++;
  }
  if(successPost == 1) {
    console.log(Var.data);
    response.send("server: data recieved");
  }
  else 
    response.send("server: wrong DATA type");
});

exports.Post = Post;
