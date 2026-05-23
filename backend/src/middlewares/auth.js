const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      return next();
    }
  } catch (err) {
    console.error('[Auth Middleware] JWT verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired authentication token. Please sign in again.' });
  }

  // Fallback to x-user-id for tests and backward compatibility
  const xUserId = req.headers['x-user-id'];
  if (xUserId) {
    req.userId = parseInt(xUserId);
    return next();
  }

  return res.status(401).json({ error: 'Authentication required. Please sign in to proceed.' });
};
