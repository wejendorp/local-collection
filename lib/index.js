/*
 * local-collection
 * Collection component
 *
 * @author Jacob Wejendorp <jacob@wejendorp.dk>
 */
var Store   = require('store');
var Emitter = require('emitter');

var proto = require('./proto');
var statics = require('./static');

/**
 * Initialize a new collection with the given `model`.
 *
 * @param {Model} model
 * @param {String} Name of collection, if not model.modelName
 * @api public
 */

function createCollection(model, name) {

  function collection(models, id) {
    if(!this instanceof collection) return new collection(models, id);
    if(typeof models === 'string') {
      id = models;
      models = null;
    }
    this.model.prototype.collection = this;

    this._id = id || null;
    this.keys = models ? models.map(function(m) {
      if(typeof m ==='string')
        return m;
      return m.primary();
    }) : [];
  }

  model.prototype.store = function() {
    this.collection.set(this);
  };
  model.prototype.remove = function() {
    this.collection.remove(this);
  };
  model.obtain = function() {
    this.collection.obtainOne.apply(this.collection, arguments);
  };

  model.prototype.collection = collection;
  collection._store = Store.namespace(name || model.modelName);
  collection.models = {};
  collection.collections = {};
  collection.model = collection.prototype.model = model;

  collection.prototype.collection = collection;
  for(var key in proto) collection.prototype[key] = proto[key];
  for(var key in statics) collection[key] = statics[key];

  return collection;
}


module.exports = createCollection;
