const getDb = require("../utils/database").getDb;
const mongodb = require('mongodb');

class Product {
  constructor(title, description, imageUrl, price) {
    this.title = title;
    this.description = description;
    this.imageUrl = imageUrl;
    this.price = price;
  }

  save() {
    const db = getDb();
    return db.collection("products").insertOne(this);
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        return Promise.resolve(products);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findById(prodId) {
    const db = getDb();
    return db.collection("products")
      .find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then((product) => {
        console.log(product);
        return product;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  update()
}

module.exports = Product;
