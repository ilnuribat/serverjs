/*
* Experiments with file system
*/

var fs = require('fs');

fs.writeFile('./ex' + '.log', "ilnuribat@gmail.com", function(error) {
  if(error) {
    console.log("there is an error");
  } else {
    console.log("success writing to file");
    }
});