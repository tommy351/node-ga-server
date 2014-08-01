var request = require('request'),
  Promise = require('bluebird'),
  querystring = require('querystring'),
  util = require('./util');

var Query = module.exports = function(){
};

Query.prototype.startDate = function(date){
  if (date == null) throw new Error('date is required!');

  this.params['start-date'] = util.formatDate(date);
  return this;
};

Query.prototype.start = Query.prototype.startDate;

Query.prototype.endDate = function(date){
  if (date == null) throw new Error('date is required!');

  this.params['end-date'] = util.formatDate(date);
  return this;
};

Query.prototype.end = Query.prototype.endDate;

Query.prototype.metrics = function(metrics){
  if (metrics == null) throw new Error('metrics is required!');

  if (Array.isArray(metrics)) metrics = metrics.join(',');
  this.params.metrics = metrics;
  return this;
};

Query.prototype.dimensions = function(dimensions){
  if (dimensions == null) return;

  if (Array.isArray(dimensions)) dimensions = dimensions.join(',');
  this.params.dimensions = dimensions;
  return this;
};

Query.prototype.sort = function(sort){
  if (sort == null) return;

  if (Array.isArray(sort)) sort = sort.join(',');
  this.params.sort = sort;
  return this;
};

Query.prototype.filters = function(filters){
  if (filters == null) return;

  if (Array.isArray(filters)) filters = filters.join(',');
  this.params.filters = filters;
  return this;
};

Query.prototype.segment = function(segment){
  if (segment == null) return;

  this.params.segment = segment;
  return this;
};

Query.prototype.samplingLevel = function(level){
  if (level == null) return;

  this.params.samplingLevel = level;
  return this;
};

Query.prototype.startIndex = function(index){
  if (index == null) return;

  this.params['start-index'] = +index;
  return this;
};

Query.prototype.skip = function(i){
  if (i == null) return;

  return this.startIndex(+i + 1);
};

Query.prototype.maxResults = function(max){
  if (max == null) return;

  this.params['max-results'] = +max;
  return this;
};

Query.prototype.limit = Query.prototype.maxResults;

Query.prototype.output = function(output){
  if (output !== 'json' && output !== 'dataTable') return;

  this.params.output = output;
  return this;
};

Query.prototype.fields = function(fields){
  if (fields == null) return;

  this.params.fields = fields;
  return this;
};

Query.prototype.prettyPrint = function(prettyPrint){
  if (prettyPrint == null) return;

  this.params.prettyPrint = !!prettyPrint;
  return this;
};

Query.prototype.userIp = function(ip){
  if (ip == null) return;

  this.params.userIp = ip;
  return this;
};

Query.prototype.ip = Query.prototype.userIp;

Query.prototype.quotaUser = function(quotaUser){
  if (quotaUser == null) return;

  this.params.quotaUser = quotaUser;
  return this;
};

Query.prototype.exec = function(callback){
  var params = this.params;

  if (params['start-date'] == null) throw new Error('start date is required!');
  if (params['end-date'] == null) throw new Error('end date is required!');
  if (params.metrics == null) throw new Error('metrics is required!');

  return this._getToken().then(function(token){
    return new Promise(function(resolve, reject){
      request.get('https://www.googleapis.com/analytics/v3/data/ga', {
        headers: {
          Authorization: 'Bearer ' + token.value
        },
        qs: params
      }, function(err, res, body){
        if (err) return reject(err);

        var data = JSON.parse(body);
        if (res.statusCode !== 200) return reject(util.formatError(data.error));

        resolve(data);
      });
    });
  }).nodeify(callback);
};

Query.prototype._getToken = function(callback){
  var self = this;

  return new Promise(function(resolve, reject){
    var now = Date.now(),
      token = self.token;

    if (token.value && token.expiredAt > now) return resolve(token);

    request.post('https://accounts.google.com/o/oauth2/token', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: querystring.stringify({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        // https://developers.google.com/accounts/docs/OAuth2ServiceAccount#creatingjwt
        assertion: util.generateGWT({
          // Client ID
          iss: self.options.clientEmail,
          // Scope
          scope: 'https://www.googleapis.com/auth/analytics.readonly',
          // Always 'https://accounts.google.com/o/oauth2/token'
          aud: 'https://accounts.google.com/o/oauth2/token',
          // Private key
          key: self.options.privateKey
        })
      }),
      encoding: 'utf8'
    }, function(err, res, body){
      if (err) return reject(err);

      var data = JSON.parse(body);
      if (res.statusCode !== 200) return reject(util.formatError(data.error));

      token.value = data.access_token;
      token.expiredAt = now + data.expires_in * 1000;

      resolve(token);
    });
  }).nodeify(callback);
};