const jwt = require("jsonwebtoken");
const {asyncHandler} = require("../middleware/errorHandler");
const {hashPassword, verifyPassword} = require("../utils/argon2Password");
const {
  generateAccessToken,
  generaterefreshtoken,
} = require("../utils/generateToken");
const logger = require("../utils/logger");
const {validateRegistration, validateLogin} = require("../utils/validation");
const {
  createUser,
  findUser,
  findUserByID,
  findrefreshtokenAndDelete,
  findrefreshtoken,
} = require("../models/User");

// user registration
const registerUser = asyncHandler(async (req, res) => {
  logger.info("User registeration begin...");
  const {error} = validateRegistration(req.body);
  if (error) {
    logger.warn("Validation Error");
    const err = new Error();
    err.statusCode = 401;
    err.message = error.details[0].message;
    throw err;
  }
  const {username, password, email, nickname, confirmPassword} = req.body;
  let user = await findUser(process.env.MONGO_COLLECTION_USER, {
    $or: [{username}, {email}],
  });
  if (user) {
    logger.warn("username or email already exist");
    const err = new Error();
    err.statusCode = 402;
    err.message = "username or email already exist";
    throw err;
  }
  const hashedPassword = await hashPassword(password);
  user = await createUser(process.env.MONGO_COLLECTION_USER, {
    username: username,
    password: hashedPassword,
    email,
    nickname: nickname,
  });
  const {accessToken} = await generateAccessToken(user);
  const {refreshtoken} = await generaterefreshtoken(user);
  logger.warn("User registered successfully", user._id);
  res.status(200).json({
    success: true,
    message: "User registered successfully",
    accessToken: accessToken,
    refreshtoken: refreshtoken,
  });
});

// user login
const loginUser = asyncHandler(async (req, res) => {
  logger.info("User login begin...");
  const {error} = validateLogin(req.body);
  if (error) {
    logger.warn("Validation Error");
    const err = new Error();
    err.statusCode = 401;
    err.message = error.details[0].message;
    throw err;
  }
  const {email, password} = req.body;
  const user = await findUser(process.env.MONGO_COLLECTION_USER, {email});
  if (!user) {
    logger.warn("User not found");
    const err = new Error();
    err.statusCode = 401;
    err.message = "User not found";
    throw err;
  }
  const isPasswwordValid = verifyPassword(user.password, password);
  if (!isPasswwordValid) {
    logger.warn("Invalid Credentials");
    return res.status(400).json({
      message: "Invalid Credentials",
    });
  }
  await findrefreshtokenAndDelete(process.env.MONGO_COLLECTION_REFRESH_TOKEN, {
    userId: user._id,
  });
  const {accessToken} = await generateAccessToken(user);
  const {refreshtoken} = await generaterefreshtoken(user);
  logger.warn("User login successfully", user._id);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.cookie("refreshtoken", refreshtoken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.status(200).json({
    success: true,
    message: "User login successfully",
    accessToken: accessToken,
    refreshtoken: refreshtoken,
  });
});

// refresh token
const refreshtokens = asyncHandler(async (req, res) => {
  logger.info("User Refresh Token ...");
  const {refreshtoken} = req.body;
  if (!refreshtoken) {
    logger.warn("Invalid Credentials");
    return res.status(400).json({
      message: "Invalid Credentials",
    });
  }
  const refreshUser = await findrefreshtoken(
    process.env.MONGO_COLLECTION_REFRESH_TOKEN,
    {token: refreshtoken}
  );
  if (!refreshUser) {
    logger.warn("Token Not Found Invalid Credentials");
    return res.status(400).json({
      message: "Token Not Found Invalid Credentials",
    });
  }
  const user = await findUserByID(
    process.env.MONGO_COLLECTION_USER,
    refreshUser.userId
  );
  const {accessToken} = await generateAccessToken(user);
  logger.warn("Token Refreshed successfully", user._id);

  res.status(200).json({
    message: "Token Refreshed successfully",
    accessToken: accessToken,
  });
});

// refresh token tester
const tester = asyncHandler(async (req, res) => {
  const accessToken = req.headers["accesstoken"];
  const refreshtoken = req.headers["refreshtoken"];
  try {
    const getrefreshtoken = await findrefreshtoken(
      process.env.MONGO_COLLECTION_REFRESH_TOKEN,
      {token: refreshtoken}
    );
    if (!getrefreshtoken) throw new Error();
    const decode = jwt.verify(accessToken, process.env.JWT_SECRET);
    res.status(200).json({
      success: true,
      message: "Token are upto Date",
      user: decode,
    });
  } catch (err) {
    refreshtokens(req, res);
  }
});

// user logout
const logoutUser = asyncHandler(async (req, res) => {
  logger.info("User logout begin...");
  const refreshtoken = req.headers["refreshtoken"];
  if (!refreshtoken) {
    logger.warn("Invalid Credentials");
    return res.status(400).json({
      message: "Invalid Credentials",
    });
  }
  const refreshUser = await findrefreshtoken(
    process.env.MONGO_COLLECTION_REFRESH_TOKEN,
    {token: refreshtoken}
  );
  if (!refreshUser) {
    logger.warn("Invalid Credentials");
    return res.status(400).json({
      message: "Invalid Credentials",
    });
  }
  await findrefreshtokenAndDelete(process.env.MONGO_COLLECTION_REFRESH_TOKEN, {
    _id: refreshUser._id,
  });
  logger.warn("User logout successfully");
  res.status(200).json({
    success: true,
    message: "User logout successfully",
  });
});

module.exports = {registerUser, loginUser, tester, logoutUser, refreshtokens};
