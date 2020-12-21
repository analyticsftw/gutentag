// start URL
myURL = "https://juliencoquet.com/en/?foo=bar";
//TODO: add support for passing start URL via command line or query string

//define browser type 
const { chromium } = require('playwright');

// Prep MySQL
var mysql      = require('mysql');
const { exit } = require('process');
connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'gutentag'
});


function logScan(url){

  // URL management
  scanURI = new URL(url); // URL string to URL
  scanURL = scanURI.href;
  scanDomain = scanURI.hostname;

  connection.connect();
  var q = "INSERT INTO scans (scan_domain) VALUES ('" + scanDomain+ "');";
  var res = "";
  var query = connection.query(q, function (error, results, fields) {
    if (error) throw error
  });
  console.log(query);
  connection.end();
  console.log("insert id : "+ res);
  return res;
}


function logCall(scan, call, payload){  
  callTime = Date.now();
  
  var q = "INSERT INTO calls (scan_id, call_url, call_payload, call_time) VALUES ('"+scan+"','"+call+"','"+payload+"','"+callTime+"');";
  console.log ("Sending query: " + q);
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
  connection.connect();
  var q = "INSERT INTO ;"
  connection.query(q, function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results);
  });
  connection.end();
}

console.log("Starting scan for " + myURL);
startTime = new Date();
let newscan = logScan(myURL);
typeof(newscan);
console.log("Insert ID for new scan:" +newscan);

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
   
   console.log(request.url() == undefined ? "FUCK":"FUUUUUCK");   
    if (request.url()!="undefined"){
      exit;
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