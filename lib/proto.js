
var Emitter = require('emitter');
var Enumerable = require('enumerable');

Emitter(exports);
Enumerable(exports);
/**
 * Iterator implementation.
 */

exports.__iterate__ = function(){
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

exports.length = function(){
  return this.keys.length;
};

/**
 * Add a key to the iterator
 *
 * @param {String} key
 * @api private
 */

exports._addKey = function(key) {
  if(this.keys.indexOf(key) > -1)
    return;

  this.keys.push(key);

  var total = this.collection.store('keys') || [];

  if(total.indexOf(key) > -1) return;
  total.push(key);
  this.collection.store.set('keys', total);
};


/**
 * Add a key to the iterator
 *
 * @param {String} key
 * @api private
 */

exports._removeKey = function(key) {
  this.keys.splice(this.keys.indexOf(key), 1);

  var total = this.collection.store('keys') || [];
  total.splice(total.indexOf(key), 1);
  this.collection.store.set('keys', total);
};


/**
 * Add a model or array of models to the collection, updating existing models if
 * the ids are the same.
 *
 * @param {Object|Model|[Model]} models
 * @return {Model|[Model]}
 * @api public
 */

exports.set = function(models) {
  var self = this;
  var pk = this.model.primaryKey;

  if(!Array.isArray(models)) models = [models];

  var ret = models.map(function(model) {
    var key;
    // If its a model we store the instance as the new truth
    if(model instanceof self.model) {
      key = model.primary();
      var exists = self.collection.models[key];

      self.collection.models[key] = model;
      self.collection.store.set(key, model);

      if(!exists) {
        self._addKey(key);
        self.emit('add', model);
      }
      return model;
    }


    var data = model;
    // Get any existing data and update model
    key = data[pk];
    model = self.obtain(key);
    if(model) {
      self._addKey(key);
      model.set(data);
      self.collection.store.set(data[pk], model);
      return model;
    }

    // No data found, create a model
    model = new self.model(data);
    key = model.primary();

    self.collection.models[key] = model;
    self.collection.store.set(key, model);
    self._addKey(key);

    self.emit('add', model);
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

exports.obtain = function(id, create) {
  var model = this.collection.models[id];
  if(model) return model;

  var data = this.collection.store.get(id);
  if(data)
    return this.collection.models[id] = new this.model(data);

  if(create) {
    model = new this.model();
    model.primary(id);

    this.collection.models[id] = model;
    this.collection.store.set(id, model);
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

exports.clear = function() {
  // Properly remove and emit for active models
  for(var key in this.collection.models) {
    this.remove(key);
  }
  this.collection.store.clear();
};


/**
 * Remove a model by id from the collection.
 *
 * @param {String|Model} id or model instance to remove
 * @return {Model|null}
 * @api public
 */

exports.remove = function(model) {
  var id = model;
  if(model instanceof this.model)
    id = model.primary();

  model = this.collection.models[id];
  if(model)
    delete this.collection.models[id];

  this.collection.store.remove(id);
  this._removeKey(id);

  // Not sure about what to emit
  this.emit('remove', model);
  return model || null;
};