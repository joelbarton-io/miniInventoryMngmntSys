'use strict';

class Item {
  constructor(name, category, quantity) {
    if (!this.validName(name) ||
      !this.validCategory(category) ||
      !this.validQuantity(quantity)) {
      throw new Error("Invalid Item Properties"); // throws error instance of returning object
    }

    this._name = name;
    this._category = category;
    this.quantity = quantity;
    this._SKU = this.makeSKU(name, category);
  }

  makeSKU(name, category) { // creates new array
    const nameParts = name.split(" ");
    let firstThree = nameParts.reduce((acc, word) => {
      if (acc.length < 3) {
        return acc + word.slice(0, 3 - acc.length);
      }
      return acc;
    }, "");
    return `${firstThree}${category.slice(0, 2)}`.toUpperCase();
  }

  validName(name) {
    return name.replace(/\s/g, '').length >= 5;
  }

  validCategory(category) {
    return this.validName(category) && !/\s/.test(category);
  }

  validQuantity(quantity) {
    return quantity !== undefined && typeof quantity === 'number';
  }
}

const ItemManager = {
  items: [],
  create(itemName, itemCategory, itemQuantity) {
    try {
      const newItem = new Item(itemName, itemCategory, itemQuantity);
      this.addItem(newItem);
      return true;
    } catch (error) {
      console.error(error.message);
      return false;
    }
  },
  addItem(newItem) {
    const existingItem = this.items.find(item => item._SKU === newItem._SKU);
    if (existingItem) {
      existingItem.quantity += newItem.quantity;
    } else {
      this.items.push(newItem);
    }
  },
  update(sku, propsToUpdate) {
    const item = this.items.find(item => item._SKU === sku);
    if (item) {
      for (const prop in propsToUpdate) {
        if (item.hasOwnProperty(prop)) {
          item[prop] = propsToUpdate[prop];
        }
      }
    }
  },
  delete(sku) {
    const index = this.items.findIndex(item => item._SKU === sku);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  },
  inStock() {
    return this.items.filter(item => item.quantity > 0);
  },
  itemsInCategory(category) {
    return this.items.filter(item => item._category === category);
  }
};

const ReportManager = {
  init(itemManagerObj) {
    this.items = itemManagerObj;
  },
  createReporter(sku) {
    const item = this.items.items.find(item => item._SKU === sku);
    if (!item) return null;
    return {
      itemInfo() {
        for (const prop in item) {
          console.log(`${prop}: ${item[prop]}`);
        }
      }
    };
  },
  reportInStock() {
    const inStockItems = this.items.inStock();
    console.log(inStockItems.map(item => item._name).join(", "));
  }
};


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