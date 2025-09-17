const crypto = require("crypto");

const etagMiddleware = (req, res, next) => {
  if (req.method !== "GET") return next();

  const original = res.json.bind(res);

  res.json = (data) => {
    const body = JSON.stringify(data);
    const eTag = crypto.createHash("md5").update(body).digest("hex");
    if (req.headers["if-none-match"] === eTag) {
      res.status(304).end();
    }
    res.setHeader("ETag", eTag);
    //return res.json(data); // makes an recursive calls
    return original(data); // so i call this.
  };
  next();
};

module.exports = etagMiddleware;
