const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  // No Authorization header
  if (!header) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  // Expected format: "Bearer TOKEN"
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Invalid authorization format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach admin data to request
    req.admin = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = requireAuth;
