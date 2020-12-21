var mysql      = require('mysql');
const { exit } = require('process');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'gutentag'
});
 
connection.connect();
var q = "INSERT INTO scans (scan_domain) VALUES ('juliencoquet.com');";
connection.query(q, function (error, results, fields) {
    //if (error) throw error;
    console.log('The solution is: ', results.insertId);
  });
connection.end();
