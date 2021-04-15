; (function (context) {
  'use strict';

  var store = localStorage;

  function Stores(key) {
    this.key = key;
    if (!store[key]) {
      store[key] = JSON.stringify([]);
    }
  }

  Stores.fn = Stores.prototype;

  Stores.fn.find = function (id, cb) {
    var items = JSON.parse(store[this.key]);
    var item = items
      .filter(function (item) {
        return id === item.id;
      });
    cb.call(this, item[0] || {});
  };
  let num = 0
  Stores.fn.findAll = function (cb) {
    let todos;
    axios.get('http://localhost:3000/todos', {
      headers: {
        ['x-auth']: localStorage.getItem('token')
      }
    }).then(res => {
      todos = res.data.todos
      console.log('new data')
    }).then(() => {
      if (todos) cb.call(this, todos); store[this.key] = JSON.stringify(todos);
    })
  };

  Stores.fn.save = function (item, cb, options) {
    var items = JSON.parse(store[this.key]);
    // Implementar Update Multiple
    // if ( options && options.multi ) {
    // }

    // Update
    if (item.id) {
      items = items
        .map(function (x) {
          if (x.id === item.id) {
            for (var prop in item) {
              x[prop] = item[prop];
            }
            axios.patch(`http://localhost:3000/todos/${x._id}`, { text: x.text, completed: x.completed })
              .then(re => console.log(re))
          }
          return x;
        });
      // Insert
    } else {
      // item.id = new Date().getTime();
      items.push(item);
    }

    store[this.key] = JSON.stringify(items);

    cb.call(this, item);
    // this.findAll(cb);

  };

  Stores.fn.destroy = async function (id, cb) {
    var items = await JSON.parse(store[this.key]);
    let deletedItem = await items.filter(item => item.id === id)[0]
    await console.log(items)
    await console.log(deletedItem)
    axios.delete(`http://localhost:3000/todos/${deletedItem._id}`, {
      headers: {
        ['x-auth']: localStorage.getItem('token')
      }
    }).then(res => {
      if (res) {
        console.log('success delete')
        items = items
          .filter(function (x) {
            return x.id !== id;
          });
        console.log(items)

        store[this.key] = JSON.stringify(items);

        cb.call(this, true);

      }
    })

  };


  Stores.fn.drop = function (cb) {
    store[this.key] = JSON.stringify([]);
    this.findAll(cb);
  };

  context.Stores = Stores;

})(this);