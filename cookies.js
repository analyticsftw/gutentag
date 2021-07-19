/**
 * node.js script that opens a headless browser and scans for cookies dropped without any user interaction
 * 
 * Usage:
 *  node cookies.js %URL% %outputfile%
 *  e.g.
 *  node cookies.js https://www.mightyhive.com mightyhive.json
*/


/* Dependencies */
fs = require('fs')


/* Variables*/ 
const playwright = require('playwright');


/* Handle command line arguments */
var myArgs = process.argv.slice(2);


/**
 * cookie2csv: function to write message to file
 * @param {*} cookie 
 * @param {*} filename
 * @param {*} phase
 */
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

/**
 * logHit: function to write message to file
 * @param {*} file 
 * @param {*} message 
 */
function logHit(file, message) {
    fs.appendFile(file, message+"\n", function (err) {
      if (err) {throw err; console.log(err);};
    });
}




(async () => {
    /* Instantiate headless browser */ 
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
    cookie2csv(cookies,filename,"pageload");
    
})();