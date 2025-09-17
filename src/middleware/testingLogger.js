const logger = require("../utils/logger");

const TestingLogger = (req, res, next) => {
  logger.info(`Request Method: ${req.method} to URL: ${req.url}`);
  logger.info(`Request Body: ${req.body}`);
  next();
};

module.exports = TestingLogger;
