/*
 * local-collection
 * Collection component
 *
 * @author Jacob Wejendorp <jacob@wejendorp.dk>
 */
var Emitter    = require('emitter');
var Enumerable = require('enumerable');
var Store      = require('store');


/**
 * Initialize a new collection with the given `model`.
 *
 * @param {Model} model
 * @param {String} Name of collection, if not model.modelName
 * @api public
 */

function Collection(model, name) {
  if(!this instanceof Collection) return new Collection(model);

  this.store = Store.namespace(name || model.modelName);

  this.model = model;
  this.model.prototype.collection = this;

  var collection = this;
  this.model.prototype.store = function() {
    collection.set(this);
  };

  this.models = {};
  this.keys = Object.keys(this.store.getAll());
}


/**
 * Use the given plugin `fn()`.
 *
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

Collection.use = function(fn) {
  fn(this);
  return this;
};


// Lets emit add/remove
Emitter(Collection.prototype);

// Lets make it Enumerable
Enumerable(Collection.prototype);

/**
 * Iterator implementation.
 */

Collection.prototype.__iterate__ = function(){
  var self = this;
  return {
    length: function()  { return self.length(); },
    get:    function(i) { return self.obtain(self.keys[i]); }
  };
};


/**
 * Return the collection length.
 *
 * @return {Number}
 * @api public
 */

Collection.prototype.length = function(){
  return this.keys.length;
};

/**
 * Add a key to the iterator
 *
 * @param {String} key
 * @api private
 */

Collection.prototype._addKey = function(key) {
  this.keys.push(key);
  this.store.set('keys', this.keys);
};


/**
 * Add a key to the iterator
 *
 * @param {String} key
 * @api private
 */

Collection.prototype._removeKey = function(key) {
  this.keys.splice(this.keys.indexOf(key), 1);
  this.store.set('keys', this.keys);
};


/**
 * Add a model or array of models to the collection, updating existing models if
 * the ids are the same.
 *
 * @param {Object|Model|[Model]} models
 * @return {Model|[Model]}
 * @api public
 */

Collection.prototype.set = function(models) {
  var collection = this;
  var pk = this.model.primaryKey;

  if(!Array.isArray(models)) models = [models];

  var ret = models.map(function(model) {
    var key;
    // If its a model we store the instance as the new truth
    if(model instanceof collection.model) {
      key = model.primary();
      var exists = collection.models[key];

      collection.models[key] = model;
      collection.store.set(key, model);

      if(!exists) {
        collection._addKey(key);
        collection.emit('add', model);
      }
      return model;
    }


    var data = model;
    // Get any existing data and update model
    model = collection.obtain(data[pk]);
    if(model) {
      model.set(data);
      collection.store.set(data[pk], model);
      return model;
    }

    // No data found, create a model
    model = new collection.model(data);
    key = model.primary();

    collection.models[key] = model;
    collection.store.set(key, model);
    collection._addKey(key);

    collection.emit('add', model);
    return model;
  });
  if(ret.length > 1) return ret;
  return ret[0];
};


/**
 * Obtains a model from cache, or null if nothing is found. If create flag is
 * set, will create a model instance with the given id if not found.
 *
 * @param {String} id to look up
 * @param {Bool} create flag
 * @return {Model|null}
 * @api public
 */

Collection.prototype.obtain = function(id, create) {
  var model = this.models[id];
  if(model) return model;

  var data = this.store.get(id);
  if(data)
    return this.models[id] = new this.model(data);

  if(create) {
    model = new this.model();
    model.primary(id);

    this.models[id] = model;
    this.store.set(id, model);
    this._addKey(id);
    this.emit('add', model);

    return  model;
  }
  return null;
};

/**
 * Clears the collection, emitting remove events on active models.
 *
 * @api public
 */

Collection.prototype.clear = function() {
  // Properly remove and emit for active models
  for(var key in this.models) {
    var model = this.models[key];
    this.remove(model);
  }
  // And just trash the rest
  this.store.clear();
};


/**
 * Remove a model by id from the collection.
 *
 * @param {String|Model} id or model instance to remove
 * @return {Model|null}
 * @api public
 */

Collection.prototype.remove = function(model) {
  var id = model;
  if(model instanceof this.model)
    id = model.primary();

  model = this.models[id];
  if(model)
    delete this.models[id];

  this.store.remove(id);
  this._removeKey(id);

  // Not sure about what to emit
  this.emit('remove', model);
  return model || null;
};


module.exports = Collection;
