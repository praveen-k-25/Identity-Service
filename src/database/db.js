const {MongoClient} = require("mongodb");
const logger = require("../utils/logger");

let db;

const connectDB = async () => {
  try {
    const client = await new MongoClient(process.env.MONGODB_URL);
    await client.connect();
    db = client.db();
    logger.info("Identity Service database connected");
  } catch (err) {
    logger.error("Identity Service database connection failed : ", err.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    const err = new Error();
    err.statusCode = 500;
    err.message = "Database not connected";
    throw err;
  }
  return db;
};
module.exports = {connectDB, getDB};
