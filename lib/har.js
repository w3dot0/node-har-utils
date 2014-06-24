var url = require('url');

var Har = function(str) {
  this.input = str;
  this.hostMatcher = null;
  this.cookies = null;
  this.headers = null;
  this.responseTimeRange = null;
  this.responseStatusCode = null;
};

Har.prototype.selectHost = function(hostRegexp) {
  this.hostMatcher = new RegExp(hostRegexp);
  return this;
};

Har.prototype.selectResponseTime = function(min, max) {
  this.responseTimeRange = [min, max];
  return this;
};

Har.prototype.selectStatusCode = function(pattern) {
  this.responseStatusCode = pattern;
  return this;
};

Har.prototype.setCookies = function(cookies) {
  this.cookies = cookies;
  this.parsedCookies = cookies.split(';').map(function(cookie) {
    return cookie.split('=').map(function(v) {
      return v.trim();
    });
  }).map(function(nameValue) {
    return {
      name: nameValue[0],
      value: nameValue[1],
      expires: null,
      httpOnly: false,
      secure: false
    };
  });
  return this;
};

Har.prototype.setHeaders = function(headers) {
  this.headers = headers.split(';').map(function(header) {
    return header.split('=').map(function(v) {
      return v.trim();
    });
  }).map(function(nameValue) {
    return {
      name: nameValue[0],
      value: nameValue[1]
    };
  });
  return this;
};

Har.prototype.toLog = function() {
  var logLine = function(entry) {
    return [
      entry.response.status,
      timing(entry) + 'ms',
      entry.request.method,
      entry.request.url,
      entry.response.content.size
    ].join(' ');
  };
  return this.toJSON().log.entries.map(logLine);
};



Har.prototype.toJSON = function() {
  var har = JSON.parse(this.input);
  if (this.hostMatcher) {
    var matcher = this.hostMatcher;
    har.log.entries = har.log.entries.filter(function(entry) {
      return url.parse(entry.request.url).host.match(matcher);
    });
  }
  if (this.responseTimeRange) {
    var range = this.responseTimeRange;
    har.log.entries = har.log.entries.filter(function(entry) {
      var responseTime = timing(entry);
      return responseTime > range[0] && responseTime < range[1];
    });
  }
  if (this.responseStatusCode) {
    var responseStatusCode = this.responseStatusCode;
    har.log.entries = har.log.entries.filter(function(entry) {
      return entry.response.status.toString().match(responseStatusCode);
    });
  }

  if (this.cookies) {
    var cookies = this.cookies;
    var parsedCookies = this.parsedCookies;
    har.log.entries.forEach(function(entry) {
      entry.request.cookies = parsedCookies;
      entry.request.headers.filter(function(header) {
        return header.name === 'Cookie';
      }).forEach(function(header) {
        header.value = cookies;
      });
    });
  }
  if (this.headers) {
    var customHeaders = this.headers;
    var headerNames = customHeaders.map(function(header) {
      return header.name;
    });
    har.log.entries.forEach(function(entry) {
      entry.request.headers = customHeaders.concat(
        entry.request.headers.filter(function(header) {
          // remove headers that were replaced
          return headerNames.indexOf(header.name) < 0;
        })
      );
    });
  }
  return har;
};

var timing = function(entry) {
  return Math.round(values(entry.timings).reduce(function(sum, timing) {
    return sum + Math.max(0, timing);
  }, 0));
};

var values = function(obj) {
  return Object.keys(obj).map(function(key) {
    return obj[key];
  });
};

module.exports = Har;
