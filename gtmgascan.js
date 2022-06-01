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
        // Google Analytics
        "google-analytics.com/collect",
        "google-analytics.com/g/collect",
        "google-analytics.com/j/collect",
        "google-analytics.com/r/collect",
        
        // Google Analytics legacy Urchin.js
        "google-analytics.com/__utm.gif",
        
        // Google Tag Manager
        "googletagmanager.com/gtm.js",
        
        // Google Optimize
        "googleoptimize.com",

        // Google Marketing Platform
        "doubleclick.net",
        "ads.google.com",

        // Adobe Analytics
        "/b/ss",
        "2o7.net",

        // Tealium IQ TMS
        "tiqcdn.com"
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
  try {
    var dl = await page.evaluate(() => dataLayer);
    console.log(dl.length);
  } catch (e) {
    console.log('dataLayer could not be evaluated ', e);
  }
  
  // Consent: wait for OneTrust consent banner and click 'Accept'
  //await page.click('#onetrust-accept-btn-handler');
  //await page.click('div.sb.sc.br.ne.bn.sd.se.c6.sf.mc.sg.hq.sh > div > div > div > div.bn.hq > button');
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