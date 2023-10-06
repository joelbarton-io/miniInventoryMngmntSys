function Item(name, category, quantity) {
  // item instances are used by manager instances
  // ensure all info is present; validate present information

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
  // creates, updates, and deletes items
  // provides information about items
  // const privateData = [];


  function log(item) {
    if (item instanceof Item) {

      if (item.quantity > 0) {
        console.log(`${item.quantity} <-> ${item._name}`);
      } else {

      }
    } else {
      throw TypeError('argument was not an instance of the Item class!')
    }
  }

  return {
    create(itemName, itemCategory, itemQuantity) {
      const newItem = new Item(itemName, itemCategory, itemQuantity);

      if (Object.prototype.hasOwnProperty.call(newItem, 'notValid') && newItem.notValid) {
        console.log(false);
        return false;
      } else {
        return this.addItem(newItem);
      }
    },
    items: [],
    itemsInCategory(categoryToSearch) {
      console.log(`Items in the ${categoryToSearch} category:`);
      this.items.forEach((item) => {
        if (categoryToSearch === item._category) {
          log(item);
        }
      }, this)
    },
    inStock() {
      console.log('In Stock:');
      this.items.forEach((item) => {
        if (item.quantity > 0) {
          log(item);
        }
      }, this);
    },
    addItem(item) {
      console.log('Item Added Successfully!')
      return this.items.push(item);
    },
    update(sku, propsToUpdate) {
      /*
      potentially mutating this.items
      iterate through this.items
        for each item, check if the sku matches item._SKU
        if it does, update information based on propsToUpdate object's info
      */
      const updatedItems = this.items.map((item) => {
        if (item._SKU === sku) {
          for (const prop in propsToUpdate) {
            if (
              Object
                .prototype
                .hasOwnProperty
                .call(propsToUpdate, prop)
            ) {
              item[prop] = propsToUpdate[prop];
            }
          }
        }
        return item;
      }, this);

      this.items = updatedItems; // is this a good idea to create a new array?
    },
    delete(sku) {
      /*
        mutates this.items
        removes all items from array with a specified _SKU with filter
        filtering approach creates a new object so any aliases will not work out
      */
      const filteredItems = this.items.filter((item) => {
        return item._SKU !== sku;
      }, this);
      if (filteredItems.length < this.items.length) {
        console.log(`All items with SKU: ${sku} were deleted`);
        this.items = filteredItems;
        return true;
      } else {
        console.log('Nothing was deleted');
        return false;
      }
    },

  };
}());

ItemManager.create('basket ball', 'sports', 3);           // valid item
ItemManager.create('asd', 'sports', 0);
ItemManager.create('soccer ball', 'sports', 5);           // valid item
ItemManager.create('football', 'sports');
ItemManager.create('football', 'sports', 3);              // valid item
ItemManager.create('kitchen pot', 'cooking items', 0);
ItemManager.create('kitchen pot', 'cooking', 3);          // valid item
ItemManager.create('basket ball', 'sports', 100);         // valid item
ItemManager.create('basket ball', 'sports', 10000);       // valid item

console.log(ItemManager.items); // 4 element array

ItemManager.update('BASSP', { quantity: 0 });
console.log(ItemManager.items); // 4 element array

ItemManager.itemsInCategory('sports');

function ReportsManager() {
  /*
  given some specific item, generate report for that item

  given no specific item, generate report for all items
  */
}


















// ItemManager.create('basket ball', 'sports', 0);           // valid item
/* ItemManager.create('asd', 'sports', 0);
ItemManager.create('soccer ball', 'sports', 5);           // valid item
ItemManager.create('football', 'sports');
ItemManager.create('football', 'sports', 3);              // valid item
ItemManager.create('kitchen pot', 'cooking items', 0);
ItemManager.create('kitchen pot', 'cooking', 3);          // valid item

ItemManager.items;
// returns list with the 4 valid items

ReportManager.init(ItemManager);
ReportManager.reportInStock();
// logs soccer ball,football,kitchen pot

ItemManager.update('SOCSP', { quantity: 0 });
ItemManager.inStock();
// returns list with the item objects for football and kitchen pot
ReportManager.reportInStock();
// logs football,kitchen pot
ItemManager.itemsInCategory('sports');
// returns list with the item objects for basket ball, soccer ball, and football
ItemManager.delete('SOCSP');
ItemManager.items;
// returns list with the remaining 3 valid items (soccer ball is removed from the list)

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
// quantity: 10 */