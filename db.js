var http = require('http');
var mysql = require('mysql');

//create connection to MySql Server and Data Base

var connection = mysql.createConnection( {
  host: 'localhost', 
  port: 80,
  database: 'mb',
  user: 'Ilnur', 
  password: 'Ilnur'
});

//Create a simple Web Server to respond to requests

http.createServer(function(request, response) {
  //RECIEVED A REQUEST
  //for this example respond with a HTTP 200 OK
  
  response.writeHeader(200);
  response.write('Connect to mySql\n');
  
  //Connect to mySql (if there is an error, report and terminate the request
  
  connection.connect(function(error) {
    if(error != null) {
      response.end('Error connecting to mySql:' + error + '\n');
    } else response.end('Success connection');
  });
  
  //Query the data to some data
  
  connection.query("SELECT * from mb.g WHERE ref = '806787088'", function(error, rows){
    //There was a error or not?
    
    if(error != null) {
      response.end('Query error:' + error);
    } else {
      //Shows the result on console window
      console.log(rows[0]);
      response.end('Success');
    }
    //close connection
    connection.end();
  });
  
  //The server will be listen on port 90
  
}).listen(80);