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

  function collection(models) {
    if(!this instanceof collection) return new collection(models);
    this.model.prototype.collection = this;

    this.keys = Object.keys(this.collection.store.getAll());
  }

  model.prototype.store = function() {
    this.collection.set(this);
  };
  model.prototype.remove = function() {
    this.collection.remove(this);
  };
  model.prototype.collection = this;
  collection.store = Store.namespace(name || model.modelName);
  collection.models = {};
  collection.model = collection.prototype.model = model;

  collection.prototype.collection = collection;
  for(var key in proto) collection.prototype[key] = proto[key];
  for(var key in statics) collection[key] = statics[key];

  return collection;
}


module.exports = createCollection;
