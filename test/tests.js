
// var assert = require('assert');
var LocalCollection = require('local-collection');
var store = require('store');
var assert = require('assert');

var testModel = require('model')('test').attr('id').attr('name');

describe('local-collection', function() {
  var collection;
  beforeEach(function() {
    store.clearAll();
    collection = new LocalCollection(testModel);
  });

  describe('initialization', function() {;
    it('should be an emitter', function(done) {
      collection.on('event', done);
      collection.emit('event');
    });
    it('should create a namespaced store', function(){
      collection.store('name', 'space');
      assert(store('test.name') === 'space');
    });
    it('should be empty', function() {
      assert(collection.length() === 0, 'is not empty');
    });
  });
  describe('set', function() {
    it('should create model from data', function() {
      var model = collection.set({id: 1});
      console.log(model);
      assert(model instanceof testModel, 'does not return model instance');
      assert(model.id() === 1, 'returned instance has wrong id');
    });
    it('should work for multiple values', function() {
      collection.set([
        {id: 1}, {id: 2}
      ]);
      assert(collection.length() === 2);
      assert(collection.obtain(1));
      assert(collection.obtain(2));
    });
    it('should emit add event', function(done) {
      var id = 'beef';
      assert(!collection.obtain('beef'), 'collection already has beef');

      collection.on('add', function(m) {
        assert(m instanceof testModel, 'does not pass model instance');
        assert(m.id() === id, 'emitted instance has wrong id')
      });
      collection.set({id: id});
    });
  });

  describe('obtain', function() {
    it('should return same instance', function() {
      var m1 = collection.obtain(3, {create:true});
      var m2 = collection.obtain(3);
      m1.name('Morpheus');
      assert(m2.name() === 'Morpheus');
    });
    it('should return null on missing id', function() {
      assert(collection.obtain('0') === null);
    });
  });

  describe('remove', function() {

  });
  describe('clear', function() {
    before(function() {
      collection.set({id: 1});
    });
    it('should remove all values', function() {
      collection.clear();
      assert(collection.length() === 0);
      assert(collection.store.size() === 0);
    });
  });
});