/** 
 * 
 * 
*/

// Dependencies
fs = require('fs')
const { chromium } = require('playwright');

// start URL
var myArgs = process.argv.slice(2);
myURL = myArgs[0] ? myArgs[0] : "https://mightyhive.com/";
filename = myArgs[1] ?  myArgs[1] : "mightyhive.csv";
//TODO: add support for passing start URL via command line or query string


/** Add quotes to string, esp. for CSVs/text lines
 * @param  {} string : the string being passed
 * @param  {} quote : quote delimiter character, defaults to double quote '"'
 */
function addQuotes(string, quote='"'){
  var msg = quote + string + quote;
  return msg;
}


/** function to log each server call routed from playwright to CSV, assuming it matches the list of predefined tags
 * @param  {} hit : the server call payload
 * @param  {} filename : the output file
 * @param  {} site : the URL being analyzed
 */
function hit2csv(hit,filename,site){
  // Create timestamp for each call
  callTime = Date.now();
  // Sanitize inputs
  message = [addQuotes(callTime),addQuotes(site),addQuotes(hit)];
  line = message.join(";");
  // Log each call to CSV
  try {
    logHit(filename,line);
  } catch (err) {
    console.error(err);
  }
}

/** Simple file output function
 * @param  {} file
 * @param  {} message
 */
function logHit(file, message) {
  fs.appendFile(file, message+"\n", function (err) {
    if (err) {throw err; console.log(err);};
  });
}


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
          hit2csv(rs,filename,myURL);
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