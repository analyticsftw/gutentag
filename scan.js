// start URL
myURL = "https://juliencoquet.com/en/?foo=bar";
//TODO: add support for passing start URL via command line or query string

//define browser type 
const { chromium } = require('playwright');

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



async function logScan(url){

  // URL management
  scanURI = new URL(url); // URL string to URL
  scanURL = scanURI.href;
  scanDomain = scanURI.hostname;

  var q = "INSERT INTO scans (scan_domain) VALUES ('" + scanDomain+ "');";
  const result = await pool.query(q);
  const insertId = result[0].insertId;
  return insertId;
  process.exit(0);
}

console.log(logScan(myURL));
process.exit(0);

function logCall(scan, call, payload){  
  callTime = Date.now();
  
  var q = "INSERT INTO calls (scan_id, call_url, call_payload, call_time) VALUES ('"+scan+"','"+call+"','"+payload+"','"+callTime+"');";
  console.log ("Sending query: " + q);

  var connection = mysqlCnx();
  connection.connect();
  connection.query(q, function (error, results, fields) {
    if (error) {
      throw error
      console.log(error);
    };
    //console.log('The solution is: ', results);
    // Let MySQL work
  });
  connection.end();
}

function logURL(call, payload){
  var connection = mysqlCnx();
  connection.connect();
  var q = "INSERT INTO url;"
  connection.query(q, function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results);
  });
  connection.end();
}

const newscan="";
const startScan = async () =>{
  console.log("Starting scan for " + myURL);
  startTime = new Date();
  newscan = await logScan(myURL);
  console.log("Insert ID for new scan:" +newscan);
  return newscan;
}

// Launching browser, everything below this is async
(async () => {

  const browser = await chromium.launch({
	  headless: true
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Log and continue all network requests
  page.route('**', route => {
    
    /*
    console.log(route.request().url());
    console.log("REQUEST: "+request.url());
    console.log(request.url(), JSON.stringify(request.headers()));
    */
   const request = route.request();
   
    if (request.url()!="undefined"){
      rec = logCall(newscan, request.url(), JSON.stringify(request.headers()));
    }
    return route.continue();
  });
  
  await page.goto(myURL);
  await page.click('#onetrust-accept-btn-handler');
  await page.waitForLoadState('networkidle');
  await browser.close();
  endTime = new Date();
  scanTime = startTime - endTime;
  //TODO update scan time

})();