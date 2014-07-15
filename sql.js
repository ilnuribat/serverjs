var Var = require('./variables.js');
var connectionSQL = null;
var sqlData;

var main = function (query) {
  connectionSQL = Var.mysql.createConnection( {
    host: 'localhost', 
    port: 3306,
    database: 'server',
    user: 'root', 
    password: ''
  });
  
  connectionSQL.connect(function(error) {
    if(error != null) {
      console.log('Error connecting to mySql:' + error + '\n');
    }// else console.log('Success connection');
  });
  
  //Query the data to some data
  connectionSQL.query(query, function(error, rows){
    //There was a error or not?
    
    if(error != null) {
      console.log('Query error:' + error);
    } else {
     // console.log(rows);
     sqlData = rows; 
    }
  });
  
  console.log("v\n", sqlData);
  connectionSQL.end();
  return sqlData;
};

exports.main = main;
