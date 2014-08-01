var crypto = require('crypto');

exports = module.exports = require('util');

var toBase64 = exports.toBase64 = function(str){
  return new Buffer(JSON.stringify(str)).toString('base64');
};

exports.generateGWT = function(data){
  var now = parseInt(Date.now() / 1000);

  var header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  var claims = {
    iss: data.iss,
    scope: data.scope,
    aud: data.aud,
    exp: now + 60 * 60,
    iat: now
  };

  if (data.sub) claims.sub = data.sub;

  var jwt = toBase64(header) + '.' + toBase64(claims),
    signature = crypto.createSign('sha256').update(jwt).sign(data.key, 'base64');

  return jwt + '.' + signature;
};

exports.formatDate = function(date){
  if (typeof date === 'string') return date;
  date = new Date(date);

  var month = date.getMonth() + 1,
    day = date.getDate(),
    str = date.getFullYear();

  str += '-';
  if (month < 10) str += '0';
  str += month;

  str += '-';
  if (day < 10) str += '0';
  str += day;

  return str;
};

exports.formatError = function(data){
  var err = new Error(data.message + ' (Code: ' + data.code + ')');
  err.code = data.code;

  return err;
};