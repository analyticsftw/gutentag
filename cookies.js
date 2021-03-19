var myArgs = process.argv.slice(2);
//console.log(myArgs[0]);
const playwright = require('playwright');

(async () => {
    const browser = await playwright['chromium'].launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    var url = 'https://www.kia.com/be/';
    url = !myArgs ? url : myArgs[0];
    await page.goto(url);
    cookies = await context.cookies();
    for (i=0;i<cookies.length;i++){
        cookies[i].siteURL=url;
    }

    //await page.screenshot({ path: `example-${browserType}.png` });
    await page.waitForLoadState('networkidle');
    await browser.close();
    console.log(cookies);
})();