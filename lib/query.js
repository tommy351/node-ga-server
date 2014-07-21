var request = require('request'),
  querystring = require('querystring'),
  util = require('./util');

var Query = module.exports = function(){
};

Query.prototype.startDate = function(date){
  this.params['start-date'] = util.formatDate(date);
  return this;
};

Query.prototype.start = Query.prototype.startDate;

Query.prototype.endDate = function(date){
  this.params['end-date'] = util.formatDate(date);
  return this;
};

Query.prototype.end = Query.prototype.endDate;

Query.prototype.metrics = function(metrics){
  if (Array.isArray(metrics)) metrics = metrics.join(',');
  this.params.metrics = metrics;
  return this;
};

Query.prototype.dimensions = function(dimensions){
  if (Array.isArray(dimensions)) dimensions = dimensions.join(',');
  this.params.dimensions = dimensions;
  return this;
};

Query.prototype.sort = function(sort){
  if (Array.isArray(sort)) sort = sort.join(',');
  this.params.sort = sort;
  return this;
};

Query.prototype.filters = function(filters){
  if (Array.isArray(filters)) filters = filters.join(',');
  this.params.filters = filters;
  return this;
};

Query.prototype.segment = function(segment){
  this.params.segment = segment;
  return this;
};

Query.prototype.samplingLevel = function(level){
  this.params.samplingLevel = level;
  return this;
};

Query.prototype.startIndex = function(index){
  this.params['start-index'] = index;
  return this;
};

Query.prototype.skip = function(i){
  return this.startIndex(i + 1);
};

Query.prototype.maxResults = function(max){
  this.params['max-results'] = max;
  return this;
};

Query.prototype.limit = Query.prototype.maxResults;

Query.prototype.output = function(output){
  this.params.output = output;
  return this;
};

Query.prototype.fields = function(fields){
  this.params.fields = fields;
  return this;
};

Query.prototype.prettyPrint = function(prettyPrint){
  this.params.prettyPrint = prettyPrint;
  return this;
};

Query.prototype.userIp = function(ip){
  this.params.userIp = ip;
  return this;
};

Query.prototype.ip = Query.prototype.userIp;

Query.prototype.quotaUser = function(quotaUser){
  this.params.quotaUser = quotaUser;
  return this;
};

Query.prototype.exec = function(callback){
  var params = this.params;

  this._getToken(function(err, token){
    if (err) return callback(err);

    request.get('https://www.googleapis.com/analytics/v3/data/ga', {
      headers: {
        Authorization: 'Bearer ' + token.value
      },
      qs: params
    }, function(err, res, body){
      if (err) return callback(err);

      var data = JSON.parse(body);
      if (res.statusCode !== 200) return callback(new Error(body));

      callback(null, data);
    });
  });
};

Query.prototype._getToken = function(callback){
  var now = Date.now(),
    token = this.token;

  if (token.value && token.expiredAt > now) return callback(null, token);

  request.post('https://accounts.google.com/o/oauth2/token', {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: querystring.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      // https://developers.google.com/accounts/docs/OAuth2ServiceAccount#creatingjwt
      assertion: util.generateGWT({
        // Client ID
        iss: this.options.clientEmail,
        // Scope
        scope: 'https://www.googleapis.com/auth/analytics.readonly',
        // Always 'https://accounts.google.com/o/oauth2/token'
        aud: 'https://accounts.google.com/o/oauth2/token',
        // Private key
        key: this.options.privateKey
      })
    }),
    encoding: 'utf8'
  }, function(err, res, body){
    if (err) return callback(err);

    var data = JSON.parse(body);
    if (res.statusCode !== 200) return callback(new Error(data));

    token.value = data.access_token;
    token.expiredAt = now + data.expires_in * 1000;

    callback(null, token);
  });
};