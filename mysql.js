// Prep MySQL
const mysql = require('mysql2/promise');
const { exit } = require('process');

const pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'password',
    database : 'gutentag',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit:0
});

var scanDomain = "yolo.com";
(async () => {
var q = "INSERT INTO scans (scan_domain) VALUES ('" + scanDomain+ "');";
  const result = await pool.query(q);
  insertId = result[0]['insertId'];
  console.log(insertId);
  process.exit(0);
})();
