function logScan(url){
    scanURL = new URL(url);
    console.log("Scan URL: " + scanURL.hostname);
}
logScan("https://juliencoquet.com/en/")