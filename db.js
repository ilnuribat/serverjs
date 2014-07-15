var http = require('http');
var mysql = require('mysql');

//create connection to MySql Server and Data Base

var connection = null;

//Create a simple Web Server to respond to requests

http.createServer(function(request, response) {
  //RECIEVED A REQUEST
  //for this example respond with a HTTP 200 OK
  response.write('Connect to mySql\n');
  
  //Connect to mySql (if there is an error, report and terminate the request
  connection = mysql.createConnection( {
    host: 'localhost', 
    port: 3306,
    database: 'server',
    user: 'root', 
    password: ''
  });
  
  connection.connect(function(error) {
    if(error != null) {
      response.end('Error connecting to mySql:' + error + '\n');
    } else response.end('Success connection');
  });
  
  //Query the data to some data
  
  connection.query("SELECT * from direction WHERE 1", function(error, rows){
    //There was a error or not?
    
    if(error != null) {
      response.end('Query error:' + error);
    } else {
      //Shows the result on console window
      for(var i in rows)
        console.log(rows[i]);
      response.end('Success');
    }
    
    //close connection
    connection.end();
  });
  
  //The server will be listen on port 80
  
}).listen(80);