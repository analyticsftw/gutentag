# gutentag
A suite of node.js scripts to:

* audit cookie collection on websites, with our without user consent,
* trace digtal marketing tags and related server calls

Results can be logged to CSV files for further processing.

## Scripts
* `cookies.js` : tracks cookies being dropped at the page load level, without any user interaction.
* `cookies_count.js` : same principle as `cookies.js`, just returns a number of cookies dropped, higher usually meaning less compliant with misc. privacy regulations
* `gtmgascan.js` : listens for Google tags being fired (Google Analytics, Tag Manager, and more) [work in progress]
* `scan.js` : looks for cookies dropped without consent (much like `cookies.js`) then clicks the consent banner to record cookies placed after consent is given
* `support_functions.js` : provides... support functions to the various scripts, mostly formatting and file output functions