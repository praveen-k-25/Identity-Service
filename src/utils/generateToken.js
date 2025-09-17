const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {createrefreshtoken} = require("../models/User");

const generateAccessToken = async (user) => {
  const accessToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {expiresIn: "10m"}
  );

  return {
    accessToken,
  };
};

const generaterefreshtoken = async (user) => {
  const cryptorefreshtoken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 2);

  await createrefreshtoken(process.env.MONGO_COLLECTION_REFRESH_TOKEN, {
    token: cryptorefreshtoken,
    userId: user._id,
    expiresAt,
    createdAt: new Date(),
  });
  return {refreshtoken: cryptorefreshtoken};
};

module.exports = {generateAccessToken, generaterefreshtoken};
