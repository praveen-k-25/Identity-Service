const dbModel = require("./dbModel");

// find User
async function findUser(collectionName, value) {
  return await dbModel(collectionName).findOne(value);
}
async function findUserByID(collectionName, value) {
  return await dbModel(collectionName).findOne({_id: value});
}

// Create User
async function createUser(collectionName, value) {
  const user = await dbModel(collectionName).insertOne(value);
  return await dbModel(collectionName).findOne({_id: user.insertedId});
}

// Refresh Token
async function createrefreshtoken(collectionName, value) {
  const collection = await dbModel(collectionName);
  collection.createIndex({token: 1}, {unique: true});  
  collection.createIndex({expiresAt: 1}, {expireAfterSeconds: 0});
  await collection.insertOne(value);
}

async function findrefreshtoken(collectionName, value) {
  return await dbModel(collectionName).findOne(value);
}
async function findrefreshtokenAndDelete(collectionName, value) {
  return await dbModel(collectionName).findOneAndDelete(value);
}

module.exports = {
  findUser,
  findUserByID,
  createUser,
  createrefreshtoken,
  findrefreshtokenAndDelete,
  findrefreshtoken,
};
