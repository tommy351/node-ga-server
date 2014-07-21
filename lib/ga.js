var Query = require('./query'),
  util = require('./util');

var GoogleAnalytics = module.exports = function(options){
  if (!options.id) throw new Error('options.id is required!');
  if (!options.clientEmail) throw new Error('options.clientEmail is required!');
  if (!options.privateKey) throw new Error('options.privateKey is required!');

  this.options = options;

  this.token = {
    value: '',
    expiredAt: 0
  };

  var _Query = this.Query = function(){
    Query.apply(this, arguments);
  };

  _Query.prototype.options = options;
  _Query.prototype.token = token;
  _Query.prototype.params = {ids: 'ga:' + options.id};

  util.inherits(this.Query, Query);
};

var keys = Object.keys(Query.prototype);

keys.forEach(function(key){
  if (key[0] === '_') return;

  GoogleAnalytics.prototype[key] = function(){
    return new this.Query()[key]();
  };
});