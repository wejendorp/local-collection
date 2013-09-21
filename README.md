# local-collection
The local-collection API exposes localStorage powered collections courtesy of
[nbubna/store](https://github.com/nbubna/store), with the added power of
[component/enumerable](https://github.com/component/enumerable).


Idea: Use localStorage to store and retrieve models, making sure each model (by id)
only exists once in the application.

This will allow views using the same model to always stay in sync.

The only requirements for the model is that the methods `model.set`
and `model.primary` exist.
The collection will be namespaced with `model.modelName` or the `options.name` parameter.


## Installation

    $ component install wejendorp/local-collection

## Example

```js
// user-collection
var LocalCollection = require('local-collection');

var model = require('user');
module.exports = new LocalCollection(model);
```

```js
var UserCollection = require('user-collection');
// look up the key `user.me` and return a model:
var me = UserCollection.obtain('me');

```


## API

### populate(models)
Populates the store with a list of models.

### clear()
Clears the collection store

### add(model)
Adds the model to cache, overwriting an already existing model with the same id.

### upsert(model)
Adds the model to cache or updates an already existing model with the same id.

### obtain(id)
Returns the model with the chosen id from cache.

### remove(id)
Removes the model from cache.

### Enumerable
All [component/enumerable](https://github.com/component/enumerable) methods are available
for filtering and processing.


## Dependencies
[component/emitter](https://github.com/component/emitter)
[component/enumerable](https://github.com/component/enumerable)
[nbubna/store](https://github.com/nbubna/store)

## License
MIT