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
filename = "datalayer.csv";
filename = myArgs[1] ?  myArgs[1] : filename;
console.log("Starting scan for " + myURL);
startTime = new Date();

// Launching browser, everything below this is async
(async () => {
  // Starting headless browser
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Configure the navigation timeout
  await page.setDefaultNavigationTimeout(0);

  // Navigate to the specified URL
  await page.goto(myURL);

  // Google Tag Manager: look for data layer
  var dataLayer = await page.evaluate(() => window.dataLayer);
  
  dl = dataLayer;
  if (dl){
    
     // loop through all datalayer variables (levels)
    for (var i=0; i<dl.length; i++){
      // break down into key/value pairs
      Object.keys(dl[i]).forEach(function(key) {
        var pkey = key;
        var pvalue = dl[i][key];
        // does the value contain a subkey?
          if (typeof(pvalue)==="object" && pvalue !== null){
            // Look for subkeys
            Object.keys(pvalue).forEach(function(mkey) {
              var string_to_log = myURL+";"+i+";"+pkey +"."+mkey + ";" + pvalue[mkey];
              sf.logHit(filename,string_to_log);
            });
          } else {
            var string_to_log = myURL+";"+i+";"+pkey +";"+pvalue;
            sf.logHit(filename,string_to_log);
          }
      
        //sf.logHit(filename,i+";"+pkey+";"+pvalue);
      });
    }
  } else {
    console.log("No data layer found");
  }
 
  
  // Consent: wait for OneTrust consent banner and click 'Accept'
  //await page.click('#onetrust-accept-btn-handler');
  
  // Close headless browser after traffic stops
  await page.waitForLoadState('networkidle');
  
  // Evidon/Crownpeak banner: click 'Accept'
  //await page.click('button#_evidon-accept-button');
  
  await browser.close();
  
  // Time calculation for performance reasons
  endTime = new Date();
  scanTime =  endTime - startTime;
  console.log("Scanned " + myURL + " in " + scanTime+ "s");
  
  //TODO update scan time

})();