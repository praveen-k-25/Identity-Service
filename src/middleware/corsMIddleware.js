const allowedOrigins = [
  "http://localhost:4001",
  "http://localhost:4002",
  "http://localhost:4003",
];

const CorsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, X-Api-Key, X-CSRF-Token"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Max-Age", "600"); // cache preflight for 10 mins

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  next();
};

module.exports = CorsMiddleware;
