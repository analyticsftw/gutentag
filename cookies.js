/**
 * node.js script that opens a headless browser and scans for cookies dropped without any user interaction
 * 
 * Usage:
 *  node cookies.js %URL% %outputfile%
 *  e.g.
 *  node cookies.js https://www.mightyhive.com mightyhive.json
*/


/* Dependencies */

var sf = require('./support_functions.js');
const playwright = require('playwright');


/* Handle command line arguments */
var myArgs = process.argv.slice(2);

/* Instantiate headless browser and scan elements in requested page */
(async () => { 
    const browser = await playwright['chromium'].launch();
    const context = await browser.newContext();
    const page = await context.newPage();    

    var url = 'https://www.mightyhive.com/'; // default URL to scan
    url = myArgs[0] ? myArgs[0] : url; // use command line argument  #1 if provided
    filename = myArgs[1] ?  myArgs[1] : "cookies_mightyhive.csv";

    /* Visit URL from command line or variable */
    await page.goto(url);

    /* Wait for cookies to be set*/
    cookies = await context.cookies();
    for (i=0;i<cookies.length;i++){
        cookies[i].siteURL=url;
    }

    /* Wait for the browser to stop receive network requests (page is loaded) before closing it*/
    await page.waitForLoadState('networkidle');
    await browser.close();

    /* Log cookies JSON to file */
    sf.cookie2csv(cookies,filename,"pageload");
    
})();