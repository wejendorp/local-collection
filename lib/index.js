/*
 * local-collection
 * Collection component
 *
 * @author Jacob Wejendorp <jacob@wejendorp.dk>
 */
var Store      = require('store');

var proto = require('./proto');

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

    var self = this;
    this.model.prototype.store = function() {
      self.set(this);
    };
    this.model.prototype.remove = function() {
      self.remove(this);
    };

    this.keys = Object.keys(this.collection.store.getAll());
  }
  collection.store = Store.namespace(name || model.modelName);
  collection.models = {};
  collection.model = collection.prototype.model = model;

  /**
   * Use the given plugin `fn()`.
   *
   * @param {Function} fn
   * @return {Function} self
   * @api public
   */

  collection.use = function(fn) {
    fn(this);
    return this;
  };

  collection.prototype.collection = collection;
  for(var key in proto) collection.prototype[key] = proto[key];

  return collection;
}


module.exports = createCollection;
