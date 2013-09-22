# local-collection
The local-collection API exposes localStorage powered collections courtesy of
[nbubna/store](https://github.com/nbubna/store), with the added power of
[component/enumerable](https://github.com/component/enumerable).


Idea: Use localStorage to store and retrieve models, making sure each model (by id)
only exists once in the application.

This will allow views using the same model to always stay in sync.

It is built to contain instances of [component/model](https://github.com/component/model).

## Installation

    $ component install wejendorp/local-collection

## Example

```js
// user-collection
var LocalCollection = require('local-collection');

var model = require('model').attr('id').attr('name');
module.exports = new LocalCollection(model);
```

```js
var UserCollection = require('user-collection');
// look up the key `user.me` and return a model even if it doesnt exist:
var me = UserCollection.obtain('me', {create: true});
me.name('Wejendorp');
me.store(); // Write it back to collection.
```


## API

### set(models)
Adds the model(s) to cache or updates an already existing model with the same id.
#### model.store()
The model is extended with a `store` method, equivalent to `model.save`, but only
writing to localStorage.

### obtain(id, options)
Returns the model with the chosen id from cache.

### remove(id)
Removes the model from cache.

### clear()
Clears the collection store


### Enumerable
All [component/enumerable](https://github.com/component/enumerable) methods are available
for filtering and processing.


## Dependencies

- [component/emitter](https://github.com/component/emitter)
- [component/enumerable](https://github.com/component/enumerable)
- [nbubna/store](https://github.com/nbubna/store)

## License
MIT