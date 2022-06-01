/**
 * node.js script that opens a headless browser and scans for cookies dropped without any user interaction
 * 
 * Usage:
 *  node scan.js %URL% %outputfile%
 *  e.g.
 *  node scan.js https://www.mightyhive.com mightyhive.json
*/


/* Dependencies */
fs = require('fs')
var sf = require('./support_functions.js');

// start URL
var myArgs = process.argv.slice(2);
myURL = myArgs[0] ? myArgs[0] : "https://mightyhive.com/";
filename = myArgs[1] ?  myArgs[1] : "mightyhive_cookies.csv";
//TODO: add support for passing start URL via command line or query string

//define browser type 
const { chromium } = require('playwright');

const newscan = "";
console.log("Starting scan for " + myURL);
startTime = new Date();

// Launching browser, everything below this is async
(async () => {

  const browser = await chromium.launch({
    headless: true
  });

  const context = await browser.newContext({ignoreHTTPSErrors:true});
  const page = await context.newPage();

  /*
  // Log and continue all network requests
  page.route('**', route => {
    const request = route.request();

    if (request.url() != "undefined") {
      //rec = logCall(newscan, request.url(), JSON.stringify(request.headers()));
    }
    return route.continue();
  });
  */
  sf.logHit(filename,"\n");
  await page.goto(myURL);
  cookies = await context.cookies();
  var cl = 0; cl = cookies.length;
  for (i = 0; i < cl; i++) {
    cookies[i].siteURL = myURL;
  }
  sf.cookie2csv(cookies,filename,"before");
  //await page.click('#onetrust-accept-btn-handler');
  await page.click('#accept-all-cookies');
  cookies = await context.cookies();
  var cl = 0; cl = cookies.length;
  for (i = 0; i < cl; i++) {
    cookies[i].siteURL = myURL;
  }
  await page.waitForLoadState('networkidle');
  sf.cookie2csv(cookies,filename,"after");
  await browser.close();
  endTime = new Date();
  scanTime =  endTime - startTime;
  console.log("Scanned " + myURL + " in " + scanTime+ "s");
  //TODO update scan time

})();