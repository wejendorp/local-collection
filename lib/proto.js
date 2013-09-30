
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
    get:    function(i) { return self.obtainOne(self.keys[i]); }
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

exports._addKey = function(key, model) {
  if(this.keys.indexOf(key) > -1)
    return;

  this.emit('add', model);
  this.keys.push(key);
};


/**
 * Add a key to the iterator
 *
 * @param {String} key
 * @api private
 */

exports._removeKey = function(key, model) {
  if(this.keys.indexOf(key) === -1)
    return;

  this.keys.splice(this.keys.indexOf(key), 1);
  this.emit('remove', model);
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
  return this.collection.set(models).map(function(m) {
    self._addKey(m.id(), m);
    return m;
  });
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

exports.obtainOne = function(id, create) {
  var model = this.collection.obtainOne(id, create);
  if(model)
    this._addKey(id, model);
  return model;
};


/**
 * Clears the collection, emitting remove events on active models.
 *
 * @api public
 */

exports.clear = function() {
  // Properly remove and emit for active models
  for(var key in this.collection.models) {
    this.remove(key, this.collection.models[key]);
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
  model = this.collection.remove(model);
  if(!model) return null;

  this._removeKey(model.id(), model);
  return model;
};



exports.store = function(id) {
  this.collection.store(this, id);
};

exports.toJSON = function() {
  return this.keys;
};