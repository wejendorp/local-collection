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
 * @api public
 */

function Collection(model, options) {
  if(!this instanceof Collection) return new Collection(model);
  options = options || {};


  this.store = Store.namespace(options.name || model.modelName);

  this.model = model;
  this.model.prototype.collection = this;

  var collection = this;
  this.model.prototype.store = function() {
    collection.set(this);
  };

  this.models = {};
  this.keys = Object.keys(this.store.getAll());
}

// Lets emit add/remove
Emitter(Collection.prototype);

// Lets make it Enumerable
Enumerable(collection);
Collection.prototype.__iterate__ = function(){
  var self = this;
  return {
    length: function()  { return self.length(); },
    get:    function(i) { return self.obtain(self.keys[i]); }
  };
};
Collection.prototype.length = function(){
  return this.keys.length;
};

Collection.prototype._addKey = function(key) {
  this.keys.push(key);
  this.store.set('keys', this.keys);
};
Collection.prototype._removeKey = function(key) {
  this.keys.splice(this.keys.indexOf(key), 1);
  this.store.set('keys', this.keys);
};

// CRUD it up
Collection.prototype.set = function(models) {
  var collection = this;
  var pk = this.model.primaryKey;

  if(!Array.isArray(models)) models = [models];

  return models.map(function(model) {
    var key;
    // If its a model we store the instance as the new truth
    if(model instanceof collection.model) {
      key = model.primary();
      var exists = !!collection.models[key];

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
    model = collection.model(data);
    key = model.primary();

    collection.models[key] = model;
    collection.store.set(key, model);
    collection._addKey(key);

    collection.emit('add', model);
    return model;
  });
};


// Obtain model with the given id, with option to create if not exists
Collection.prototype.obtain = function(id, options) {
  var model = this.models[id];
  if(model) return model;

  options = options || {};

  var data = this.store.get(id);
  if(data)
    return this.models[id] = new this.model(data);

  if(options.create) {
    model = new this.model();
    model.primary(id);

    this.store.set(id, model);
    this._addKey(id);
    this.emit('add', model);

    return  model;
  }
  return null;
};

// Store methods
collection.clear = function() {
  // Properly remove and emit for active models
  for(var key in this.models) {
    var model = this.models[key];
    this.remove(model);
  }
  // And just trash the rest
  this.store.clear();
};

// Remove model by id
collection.remove = function(model) {
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
};



module.exports = Collection;