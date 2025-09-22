require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {GlobalErrorHandler} = require("./middleware/errorHandler");
const {router} = require("./routes/userLogRouter");
const {connectDB} = require("./database/db");
const logger = require("./utils/logger");
const rateLimiter = require("./utils/inMemoryRateLimiter");
const http = require("http");
const CorsMiddleware = require("./middleware/corsMIddleware");
const JsonParser = require("./middleware/jsonParser");
const TestingLogger = require("./middleware/testingLogger");
const etagMiddleware = require("./middleware/cacheMiddleware");

// Database Connection.
connectDB();

/* 
// study Purpose
const middlewareList = [CorsMiddleware, JsonParser, TestingLogger, rateLimiter];
const applyMiddleware = (middlewares, req, res, finalHandler) => {
  let index = 0;

  const next = (err) => {
    if (err) {
      return GlobalErrorHandler(err, req, res, next);
    }
    if (index < middlewares.length) {
      const middleware = middlewares[index++];
      middleware(req, res, next);
    } else {
      finalHandler(req, res);
    }
  };
};
// server
const server = http.createServer((req, res) => {
  applyMiddleware(middlewareList, req, res, (req, res) => {
    try {
      if (req.url.startsWith("/api")) {
        router(req, res);
      }
    } catch (err) {
      GlobalErrorHandler(err, req, res);
    }
  });
}); */
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
//app.use((req, res, next) => rateLimiter(req, res, next));
app.use(etagMiddleware);
// router
app.use("/api", router);

// Global error handler
app.use(GlobalErrorHandler);

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at : ", promise, " reason : ", reason);
});

app.listen(process.env.PORT, () => {
  logger.info(`Server is running on port ${process.env.PORT}`);
});
