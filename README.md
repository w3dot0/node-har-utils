node-har
========

Utilities for .har file manipulation.

Installation:

`npm install har-utils`

Usage
-----

modify a har file

```
var har = new Har(fs.readFileSync(harFile, 'utf-8'))
  // filter hosts (regexp)
  .selectHost('mydomain\\.com')
  // replace cookie value
  .setCookies("cookieName1=value1;cookieName2=value2")
  // set (or replace) headers
  .setHeaders("headerName1=value1;headerName2=value2")
  // generate
  .toJSON();
```

convert har file content to HTTP log entry

```
var har = new Har(harString).toLog();
```

harlog CLI: Generate log file from .har file(s)
-----------------------------------------

```
$ harlog --help
Usage:
  harlog [OPTIONS] <file.har>

Options:
  -h, --host STRING      Host Filter (only include matching entries)
  -v, --verbose          Produce more verbose output
```

hawk CLI: Prepare .har file for replay
----------------------------------

```
$ hawk --help
Usage:
  hawk [OPTIONS] <file.har>

Options:
  -h, --host STRING      Host Filter (only include matching entries)
  -c, --cookies STRING   Set Cookies (key1=value1;key2=value2;...)
  -H, --headers STRING   Set Headers (key1=value1;key2=value2;...)
  -p, --pretty           Pretty-print output
```
