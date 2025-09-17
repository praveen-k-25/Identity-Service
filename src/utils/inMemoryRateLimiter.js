const mapSet = new Map();

function rateLimiter(req, res, next) {
  const ip = req.ip;
  const windowSize = 60 * 1000;
  const limitCount = 10;
  const timestamp = Date.now();

  if (!mapSet.has(ip)) {
    mapSet.set(ip, {count: 1, timestamp: timestamp});
    return next();
  }

  const {count, timestamp: lastRequestTime} = mapSet.get(ip);

  if (timestamp - lastRequestTime > windowSize) {
    mapSet.set(ip, {count: 1, timestamp: timestamp});
    return next();
  } else if (count <= limitCount) {
    mapSet.set(ip, {count: count + 1, timestamp: timestamp});
  } else {
    return res.status(429).json({error: "Rate limit exceeded"});
  }
  return next();
}

module.exports = rateLimiter;
