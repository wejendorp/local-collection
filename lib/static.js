

var Emitter = require('emitter');

Emitter(exports);


/**
 * Use the given plugin `fn()`.
 *
 * @param {Function} fn
 * @return {Function} self
 * @api public
 */

exports.use = function(fn) {
  fn(this);
  return this;
};

exports.obtain = function(id, create) {
  var model = this.models[id] || null;
  if(model) return model;

  var data = this.store.get(id);
  if(data)
    return this.models[id] = new this.model(data);

  if(create) {
    model = new this.model();
    model.primary(id);

    this.models[id] = model;
    this.store.set(id, model);
  }
  return model;
};

exports.remove = function(model) {
  var id = model;
  if(model instanceof this.model)
    id = model.primary();

  model = this.models[id];
  if(model)
    delete this.models[id];

  this.store.remove(id);
  this._removeKey(id, model);

  return model || null;
};

exports.set = function(models) {
  var self = this;
  var pk = this.model.primaryKey;

  if(!Array.isArray(models)) models = [models];

  var ret = models.map(function(model) {
    var key;
    // If its a model we store the instance as the new truth
    if(model instanceof self.model) {
      key = model.primary();
      var exists = self.models[key];

      self.models[key] = model;
      self.store.set(key, model);

      // if(!exists) {
      self._addKey(key, model);
      // }
      return model;
    }


    var data = model;
    // Get any existing data and update model
    key = data[pk];
    model = self.obtain(key);
    if(model) {
      self._addKey(key, model);
      model.set(data);
      self.store.set(data[pk], model);
      return model;
    }

    // No data found, create a model
    model = new self.model(data);
    key = model.primary();

    self.models[key] = model;
    self.store.set(key, model);
    self._addKey(key, model);
    return model;
  });
  return ret;
};

exports._addKey = function(id, model) {
  var total = this.store('keys') || [];

  if(total.indexOf(id) > -1) return;
  total.push(id);
  this.store.set('keys', total);
  this.emit('add', model);
};

exports._removeKey = function(id, model) {
  var total = this.store('keys') || [];
  if(total.indexOf(id) === -1) return;

  total.splice(total.indexOf(id), 1);
  this.store.set('keys', total);
  this.emit('remove', model);
};
