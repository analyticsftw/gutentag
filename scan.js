fs = require('fs')

// start URL
var myArgs = process.argv.slice(2);
myURL = myArgs[0] ? myArgs[0] : "https://juliencoquet.com/en/?foo=bar";
filename = myArgs[1] ?  myArgs[1] : "cookies.csv";
//TODO: add support for passing start URL via command line or query string

//define browser type 
const { chromium } = require('playwright');

function cookie2csv(cookie,filename,phase="before") {
  const { Parser } = require('json2csv');
  const fields = [
    'date', 
    'siteURL', 
    'phase',
    'sameSite', 
    'name', 
    'value', 
    'domain', 
    'path', 
    'expires', 
    'httpOnly', 
    'secure'
  ];
  const opts = { fields };

  // Inject cookie timestamp
  callTime = Date.now();
  var cl = 0; cl = cookie.length;
  for (i = 0; i < cl; i++) {
    cookie[i].date=callTime;
    cookie[i].phase=phase;
  }
  try {
    const parser = new Parser(opts);
    const csv = parser.parse(cookies)
    // remove headers
    var lines = csv.split('\n');
    // remove one line, starting at the first position
    lines.splice(0,1);
    // join the array back into a single string
    var output = lines.join('\n');
    logHit(filename,output)
  } catch (err) {
    console.error(err);
  }
}


function logHit(file, message) {
  fs.appendFile(file, message, function (err) {
    if (err) throw err;
    console.log('Saved to '+file);
  });
}

// Prep MySQL
const mysql = require('mysql2/promise');
const { exit } = require('process');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'gutentag',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});



async function logScan(url) {

  // URL management
  scanURI = new URL(url); // URL string to URL
  scanURL = scanURI.href;
  scanDomain = scanURI.hostname;

  var q = "INSERT INTO scans (scan_domain) VALUES ('" + scanDomain + "');";
  const result = await pool.query(q);
  const insertId = result[0].insertId;
  return insertId;
  process.exit(0);
}

/*
console.log(logScan(myURL));
process.exit(0);
*/


function logCall(scan, call, payload) {
  callTime = Date.now();

  var q = "INSERT INTO calls (scan_id, call_url, call_payload, call_time) VALUES ('" + scan + "','" + call + "','" + payload + "','" + callTime + "');";
  console.log("Sending query: " + q);

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

function logURL(call, payload) {
  var connection = mysqlCnx();
  connection.connect();
  var q = "INSERT INTO url;"
  connection.query(q, function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results);
  });
  connection.end();
}

const newscan = "";
console.log("Starting scan for " + myURL);
startTime = new Date();

/*
const startScan = async () =>{
  console.log("Starting scan for " + myURL);
  startTime = new Date();
  newscan = await logScan(myURL);
  console.log("Insert ID for new scan:" +newscan);
  return newscan;
}
*/

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

    if (request.url() != "undefined") {
      //rec = logCall(newscan, request.url(), JSON.stringify(request.headers()));
    }
    return route.continue();
  });

  logHit(filename,"\n");
  await page.goto(myURL);
  cookies = await context.cookies();
  var cl = 0; cl = cookies.length;
  for (i = 0; i < cl; i++) {
    cookies[i].siteURL = myURL;
  }
  cookie2csv(cookies,filename,"before");
  await page.click('#onetrust-accept-btn-handler');
  cookies = await context.cookies();
  var cl = 0; cl = cookies.length;
  for (i = 0; i < cl; i++) {
    cookies[i].siteURL = myURL;
  }
  await page.waitForLoadState('networkidle');
  cookie2csv(cookies,filename,"after");
  await browser.close();
  endTime = new Date();
  scanTime =  endTime - startTime;
  console.log("Scanned " + myURL + " in " + scanTime+ "s");
  //TODO update scan time

})();