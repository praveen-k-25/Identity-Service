const JsonParser = (req, res, next) => {
  let body = "";
  req.on("data", (chunk) => body + chunk);
  req.on("end", () => {
    try {
      req.body = body ? JSON.parse(body) : {};
    } catch (err) {
      return next(new Error("Invalid JSON"));
    }
  });
  next();
};
module.exports = JsonParser;
