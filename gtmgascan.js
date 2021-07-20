/** 
 * 
 * 
*/

// Dependencies
var sf = require('./support_functions.js');
const { chromium } = require('playwright');

// start URL
var myArgs = process.argv.slice(2);
myURL = myArgs[0] ? myArgs[0] : "https://mightyhive.com/";
filename = myArgs[1] ?  myArgs[1] : "mightyhive.csv";

console.log("Starting scan for " + myURL);
startTime = new Date();

// Launching browser, everything below this is async
(async () => {
  // Starting headless browser
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext();
  const page = await context.newPage();

  // Log and continue all network requests
  page.route('**', route => {
    const request = route.request();
    var rs = request.url();
    if (rs != "undefined") {
      // List of identified server calls to monitor and log
      hitdomains = [
        "google-analytics.com/collect",
        "google-analytics.com/g/collect",
        "google-analytics.com/j/collect",
        "google-analytics.com/r/collect",
        "google-analytics.com/__utm.gif",
        "googletagmanager.com/gtm.js",
        "googleoptimize.com"
      ];
      for (var i=0;i<hitdomains.length;i++){
        // If request found in list, log the call
        if (rs.indexOf(hitdomains[i])!==-1){
          sf.hit2csv(rs,filename,myURL);
        }
      }
    }
    return route.continue();
  });

  // Navigate to the specified URL
  await page.goto(myURL);
  // Google Tag Manager: look for data layer
  var dl = await page.evaluate(() => dataLayer);
  // Consent: wait for OneTrust consent banner and click 'Accept'
  await page.click('#onetrust-accept-btn-handler');

  // Close headless browser after traffic stops
  await page.waitForLoadState('networkidle');
  await browser.close();
  
  // Time calculation for performance reasons
  endTime = new Date();
  scanTime =  endTime - startTime;
  console.log("Scanned " + myURL + " in " + scanTime+ "s");
  
  //TODO update scan time

})();