# Google Analytics API

[![NPM version](https://badge.fury.io/js/ga-server.svg)](http://badge.fury.io/js/ga-server)

Google Analytics API for Node.js.

## Installation

``` bash
$ npm install ga-server
```

## Usage

Create a new instance.

``` js
var GoogleAnalytics = require('ga-server');

var ga = new GoogleAnalytics({
  id: '',
  clientEmail: '',
  privateKey: ''
});
```

## API

See [here](https://developers.google.com/analytics/devguides/reporting/core/v3/reference#q_summary) for more info.

### startDate(date)

**Alias:** start

### endDate(date)

**Alias:** end

### metrics(metrics)

### dimensions(dimensions)

### sort(sort)

### filter(filters)

### segment(segment)

### samplingLevel(level)

### startIndex(index)

### skip(index)

This is an alias for `startIndex(i + 1)`.

### maxResults(max)

**Alias:** limit

### output(output)

### fields(fields)

### prettyPrint(prettyPrint)

### userIp(ip)

**Alias:** ip

### quotaUser(quotaUser)

### exec(callback)

## License

MIT