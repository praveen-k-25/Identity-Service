const {getDB} = require("../database/db");

function getCollection(collectionName) {
  const db = getDB();
  return db.collection(collectionName);
}

module.exports = getCollection;
