fs = require('fs')

// start URL
var myArgs = process.argv.slice(2);
myURL = myArgs[0] ? myArgs[0] : "https://mightyhive.com/";
filename = myArgs[1] ?  myArgs[1] : "mightyhive.csv";
//TODO: add support for passing start URL via command line or query string

//define browser type 
const { chromium } = require('playwright');


function hit2csv(hit,filename,site){
  callTime = Date.now();
  message = [callTime,site,hit];
  line = message.join(";");
  try {
    logHit(filename,line);
  } catch (err) {
    console.error(err);
  }
}


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
  fs.appendFile(file, message+"\n", function (err) {
    if (err) {throw err; console.log(err);};
    //console.log('Saved to '+file);
  });
}


const newscan = "";
console.log("Starting scan for " + myURL);
startTime = new Date();

// Launching browser, everything below this is async
(async () => {

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Log and continue all network requests
  page.route('**', route => {
    const request = route.request();
    var rs = request.url();
    if (rs != "undefined") {
      hitdomains = [
        "google-analytics.com",
        "googletagmanager.com",
        "googleoptimize.com"
      ];
      for (var i=0;i<hitdomains.length;i++){
        if (rs.indexOf(hitdomains[i])!==-1){
          //console.log("found " + hitdomains[i] + " in " + rs + " at position " + rs.indexOf(hitdomains[i]));
          hit2csv(rs,filename,myURL);
        }
      }
      //rec = logCall(newscan, request.url(), JSON.stringify(request.headers()));
    }
    return route.continue();
  });

  await page.goto(myURL);
  await page.waitForLoadState('networkidle');
  await browser.close();
  endTime = new Date();
  scanTime =  endTime - startTime;
  console.log("Scanned " + myURL + " in " + scanTime+ "s");
  //TODO update scan time

})();