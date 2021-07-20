/**
 * node.js script that opens a headless browser and return a count of cookies dropped without any user interaction
 * 
 * Usage:
 *  node cookies_count.js %URL% %outputfile%
 *  e.g.
 *  node cookies.js https://www.mightyhive.com mightyhive_cookie_count.txt
*/

/* Dependencies */
const playwright = require('playwright');

/* Handle command line arguments */
var myArgs = process.argv.slice(2);

/* Instantiate headless browser and scan for cookies in requested page */
(async () => {
    const browser = await playwright['chromium'].launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    var url = 'https://www.mightyhive.com/'; // default site, change to whatever
    url = !myArgs ? url : myArgs[0];
    await page.goto(url);
    cookies = await context.cookies();
    for (i=0;i<cookies.length;i++){
        cookies[i].siteURL=url;
    }
    /* Wait for the browser to stop receive network requests (page is loaded) before closing it*/
    await page.waitForLoadState('networkidle');
    await browser.close();

    // Output cooke count
    console.log(url + "\t" + cookies.length);
    // TODO use support function to write to file
})();
