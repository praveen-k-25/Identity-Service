const express = require("express");
const {
  registerUser,
  loginUser,
  tester,
  logoutUser,
  refreshtokens,
} = require("../contollers/identity-contoller");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/tester", tester);
router.post("/refreshtoken", refreshtokens);
router.post("/logout", logoutUser);

module.exports = {router};