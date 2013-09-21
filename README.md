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

var model = require('user');
module.exports = new LocalCollection(model);
```

```js
var UserCollection = require('user-collection');
// look up the key `user.me` and return a model:
var me = UserCollection.obtain('me');

```


## API

### set(models, options)
Adds the model(s) to cache or updates an already existing model with the same id.

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