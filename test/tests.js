
// var assert = require('assert');
var LocalCollection = require('local-collection');
var store = require('store');
var assert = require('assert');

var testModel = require('model')('test').attr('id').attr('name');
var testCollection = LocalCollection(testModel);

describe('local-collection', function() {
  var collection;
  beforeEach(function() {
    store.clearAll();
    collection = new testCollection();
  });

  describe('initialization', function() {;
    it('should be an emitter', function(done) {
      collection.once('event', done);
      collection.emit('event');
    });
    it('should create a namespaced store', function(){
      store('test.name', {id:'space'});
      assert(collection.obtainOne('name').id() === 'space');
    });
    it('should be empty', function() {
      assert(collection.length() === 0, 'is not empty');
    });
    it('should be iterable', function() {
      collection.set([{id:0}, {id: 1}]);

      var count = 0;
      collection.each(function(m, i) {
        assert(m.id() === i);
        count++;
      });
      assert(count === 2);
    });
  });

  describe('set', function() {
    it('should create model from data', function() {
      var models = collection.set({id: 1});
      assert(models[0] instanceof testModel, 'does not return model instance');
      assert(models[0].id() === 1, 'returned instance has wrong id');
    });
    it('should work for multiple values', function() {
      collection.set([
        {id: 1}, {id: 2}
      ]);
      assert(collection.length() === 2);
      assert(collection.obtainOne(1));
      assert(collection.obtainOne(2));
    });
    it('should emit add event', function(done) {
      var id = 'beef';
      collection.once('add', function(m) {
        assert(m instanceof testModel, 'does not pass model instance');
        assert(m.id() === id, 'emitted instance has wrong id')
        done();
      });
      collection.set({id: id});
    });
    it('should overwrite current instance if given a model', function() {
      var m1 = collection.set({id: 'm1', name:'m1'});
      var m2 = new testModel({id: 'm1', name:'overwrite'});
      collection.set(m2);
      assert(collection.obtainOne('m1').name() === 'overwrite');
    });
  });
  describe('store', function() {
    var id = 'ctr';
    it('should serialize to array of keys', function() {
      assert(Array.isArray(collection.toJSON()));
    });
    it('should save a collection instance under its constructor id', function() {
      var c = new testCollection(null, id);
      c.store();
      console.log(localStorage);
      assert(store('test.'+id));
    });
    it('should save a collection under id given', function() {
      var c = new testCollection();
      c.store(id);
      assert(store('test.'+id));
    });
  });

  describe('obtain', function() {
    var id = 'myId';
    beforeEach(function() {
      var c = new testCollection();
      c.store(id);
      assert(testCollection.obtain(id));
    });
    it('should return a collection instance', function() {
      var c = testCollection.obtain(id);
      assert(c instanceof testCollection);
    });
    it('should return same collection handle', function() {
      var c1 = testCollection.obtain(id);
      var c2 = testCollection.obtain(id);
      assert(c1);
      assert(c2);
      assert(c1 === c2);
    });
    it('should return null on missing id', function() {
      assert(testCollection.obtain('garbage') === null);
    });
  });

  describe('obtainOne', function() {
    it('should return same instance', function() {
      var m1 = collection.obtainOne(3, true);
      var m2 = collection.obtainOne(3, true);
      m1.name('Morpheus');
      assert(m2.name() === 'Morpheus');
    });
    it('should return null on missing id', function() {
      assert(collection.obtainOne('IDontExist') === null);
    });
    it('should emit add on create', function(done) {
      var id = 'beef';
      collection.once('add', function(m) {
        assert(m instanceof testModel, 'does not pass model instance');
        assert(m.id() === id, 'emitted instance has wrong id')
        done();
      });
      collection.obtainOne(id, {create: true});
    });
    it('returned models should be able to store self', function() {
      var m1 = testCollection.obtainOne(3, true);
      assert(typeof m1.store === 'function');
      m1.store();
    });
  });

  describe('remove', function() {
    var id = 'id';
    var model;
    beforeEach(function() {
      model = collection.set({id: id})[0];
    });
    it('should remove the model by id', function() {
      collection.remove(id);
      assert(!collection.obtainOne(id));
    });
    it('should remove by model instance', function() {
      collection.remove(model);
      assert(!collection.obtainOne(id));
    });
    it('should emit remove event', function(done) {
      collection.once('remove', function(m) {
        assert(m instanceof testModel, 'should pass model instance');
        assert(m.id() === id, 'emitted instance has wrong id');
        done();
      });
      collection.remove(id);
    });
  });

  describe('clear', function() {
    before(function() {
      collection.set({id: 1});
    });
    it('should remove all values', function() {
      collection.clear();
      assert(collection.length() === 0);
    });
  });
});