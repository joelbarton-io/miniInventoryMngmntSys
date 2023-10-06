'use strict';

function Item(name, category, quantity) {
  const invalidObject = { notValid: true };

  if (arguments.length < 3) return invalidObject;

  if (
    this.validName(name) &&
    this.validCategory(category) &&
    this.validQuantity(quantity)
  ) {
    this._name = name;
    this._category = category;
    this.quantity = quantity;
    this._SKU = this.makeSKU(name, category);

    return this; // can we think of a way to refactor this so we can rely on implicit return?
  }

  // we could add some more functionality like custom error messages for diff points of failure
  return invalidObject;
}

Item.prototype.makeSKU = function (name, category) {
  const firstThree = name.replace(/\s/g, '').slice(0, 3);
  return `${firstThree}${category.slice(0, 2)}`.toUpperCase();
}

Item.prototype.validName = function (name) {
  return name.replace(/\s/g, '').length >= 5;
}

Item.prototype.validCategory = function (category) {
  return Item.prototype.validName.call(this, category) && !/\s/.test(category);
}

Item.prototype.validQuantity = function (quantity) {
  return quantity != undefined && typeof quantity === 'number';
}

const ItemManager = (function () {
  function log(item) {
    if (!(item instanceof Item)) {
      throw TypeError('argument was not an instance of the Item class!');
    }
    if (Object.prototype.hasOwnProperty.call(item, 'quantity') && item.quantity) {
      console.log(`${item._name} : IN STOCK`); // ${item.quantity}
    } else {
      console.log(`${item._name} : OUT OF STOCK`);
    }
  }

  return {
    items: [],
    create(itemName, itemCategory, itemQuantity) {
      const newItem = new Item(itemName, itemCategory, itemQuantity);

      // this is pretty bad...
      if (
        Object
          .prototype
          .hasOwnProperty
          .call(newItem, 'notValid') &&
        newItem.notValid
      ) return false;

      this.addItem(newItem);
      return true;
    },
    addItem(newItem) {
      function looselyEqual(existingItem, newItem) {
        return (
          existingItem._name === newItem._name &&
          existingItem._category === newItem._category &&
          existingItem._SKU === newItem._SKU
        );
      }

      if (!(newItem instanceof Item)) {
        throw TypeError('argument was not an instance of the Item class!');
      }

      if (!newItem.quantity) {
        console.log('Nothing was added; detected zero quantity item!');
        return this.items.length;
      }

      if (!this.items.length) {
        console.log(`new Item: ${newItem._name} was added`);
        return this.items.push(newItem);
      }

      for (const existingItem of this.items) {
        if (looselyEqual(existingItem, newItem)) {
          existingItem.quantity += newItem.quantity;
          console.log(`quantity of Item: ${existingItem._name} increased by ${newItem.quantity}`);
          return this.items.length;
        } else {
          console.log(`new Item: ${newItem._name} was added`);
          return this.items.push(newItem);
        }
      }
    },
    update(sku, propsToUpdate) {
      for (const existingItem of this.items) {
        if (existingItem._SKU === sku) {
          for (const prop in propsToUpdate) {
            if (
              Object
                .prototype
                .hasOwnProperty
                .call(propsToUpdate, prop)
              // hard update; no reassignment or incorporation of original value
            ) existingItem[prop] = propsToUpdate[prop];
          }
        }
      }
    },
    delete(sku) {
      let deletedSomething = false;

      for (let i = 0; i < this.items.length;) {
        if (sku === this.items[i]._SKU) {
          this.items.splice(i, 1).join('');
          deletedSomething = true;
        } else {
          i++;
        }
      }

      return deletedSomething;
    },
    inStock() {
      console.log('In Stock Items:');
      this.items.forEach((item) => {
        if (
          Object
            .prototype
            .hasOwnProperty
            .call(item, 'quantity') && item.quantity) {
          log(item);
        }
      }, this);
    },
    itemsInCategory(categoryToSearch) {
      console.log(`Items in the ${categoryToSearch} category: `);
      this.items.forEach((item) => {
        if (categoryToSearch === item._category) {
          log(item);
        }
      }, this)
    },

  };
}());

const ReportManager = {
  init: function (itemManagerObj) {
    const instance = Object.create(this);
    this.items = itemManagerObj;
    return instance;
  },
  createReporter: function (sku) {
    const customReporter = Object.create(this);
    customReporter.itemInfo = function () {
      const items = this.items.items;

      items.forEach((item) => {
        if (item._SKU === sku) {
          for (const prop of Object.getOwnPropertyNames(item)) {
            console.log(`${prop} : ${item[prop]}`);
          }
        }
      });
    }

    return customReporter;
  },
  reportInStock: function () {
    let str = '';
    this.items.items.forEach((existingItem) => {
      if (existingItem.quantity) {
        str += (!str.length) ? existingItem._name : ',' + existingItem._name;
      }
    }, ItemManager.items);
    console.log(str)
  },
}


ItemManager.create('basket ball', 'sports', 3);           // valid item
ItemManager.create('soccer ball', 'sports', 5);           // valid item
ItemManager.create('football', 'sports', 3);              // valid item
ItemManager.create('kitchen pot', 'cooking', 3);          // valid item

ItemManager.items;
// returns list with the 4 valid items

ReportManager.init(ItemManager);
ReportManager.reportInStock();
// logs soccer ball,football,kitchen pot

ItemManager.update('SOCSP', { quantity: 0 });
ItemManager.inStock();
// // returns list with the item objects for football and kitchen pot
ReportManager.reportInStock();
// // logs football,kitchen pot
console.log(ItemManager.items);
ItemManager.itemsInCategory('sports');
// // returns list with the item objects for basket ball, soccer ball, and football
ItemManager.delete('SOCSP');
console.log(ItemManager.items);
// // returns list with the remaining 3 valid items (soccer ball is removed from the list)

const kitchenPotReporter = ReportManager.createReporter('KITCO');

kitchenPotReporter.itemInfo();
// logs
// skuCode: KITCO
// itemName: kitchen pot
// category: cooking
// quantity: 3

ItemManager.update('KITCO', { quantity: 10 });
kitchenPotReporter.itemInfo();
// logs
// skuCode: KITCO
// itemName: kitchen pot
// category: cooking
// quantity: 10