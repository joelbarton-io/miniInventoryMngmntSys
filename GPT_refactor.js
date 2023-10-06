/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */

class Item {
  constructor(name, category, quantity) {
    if (!this.validName(name)
      || !this.validCategory(category)
      || !this.validQuantity(quantity)) {
      throw new Error('Invalid Item Properties');
    }

    this.name = name;
    this.category = category;
    this.quantity = quantity;
    this.SKU = this.makeSKU(name, category);
  }

  makeSKU(name, category) {
    const nameParts = name.split(' ');
    const firstThree = nameParts.reduce((acc, word) => {
      if (acc.length < 3) {
        return acc + word.slice(0, 3 - acc.length);
      }
      return acc;
    }, '');
    return `${firstThree}${category.slice(0, 2)}`.toUpperCase();
  }

  validName(name) {
    return name.replace(/\s/g, '').length >= 5;
  }

  validCategory(category) {
    return this.validName(category) && !/\s/.test(category);
  }

  validQuantity(quantity) {
    return quantity !== undefined && typeof quantity === 'number' && !Number.isNaN(quantity);
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
    const existingItem = this.items.find((item) => item.SKU === newItem.SKU);
    if (existingItem) {
      existingItem.quantity += newItem.quantity;
    } else {
      this.items.push(newItem);
    }
  },
  update(sku, propsToUpdate) {
    const existingItem = this.items.find((item) => item.SKU === sku);
    if (existingItem) {
      Object.keys(propsToUpdate).forEach((prop) => {
        existingItem[prop] = propsToUpdate[prop];
      });
    }
  },
  delete(sku) {
    const index = this.items.findIndex((item) => item.SKU === sku);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  },
  inStock() {
    return this.items.filter((item) => item.quantity > 0);
  },
  itemsInCategory(category) {
    return this.items.filter((item) => item.category === category);
  },
};
const ReportManager = {
  init(itemManagerObj) {
    this.itemManager = itemManagerObj;
  },
  createReporter(sku) {
    const existingItem = this.itemManager.items.find((item) => item.SKU === sku);
    if (!existingItem) return null;
    return {
      itemInfo() {
        Object.keys(existingItem).forEach(((key) => {
          console.log(`${key}: ${existingItem[key]}`);
        }));
      },
    };
  },
  reportInStock() {
    const inStockItems = this.itemManager.inStock();
    console.log(inStockItems.map((item) => item.name).join(', '));
  },
};

ItemManager.create('basket ball', 'sports', 0); // valid item
ItemManager.create('soccer ball', 'sports', 5); // valid item
ItemManager.create('football', 'sports', 3); // valid item
ItemManager.create('kitchen pot', 'cooking', 3); // valid item

// eslint-disable-next-line no-unused-expressions
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
