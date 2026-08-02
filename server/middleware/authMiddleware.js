const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format is invalid. Must be Bearer <token>.' });
  }

  const token = parts[1];

  try {
    const secret = process.env.JWT_SECRET || 'pdf_chatbot_secret_key_2026_secure';
    const decoded = jwt.verify(token, secret);
    
    // Controllers use this user id to keep PDFs and chats user-specific.
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    return res.status(403).json({ message: 'Invalid or corrupted token.' });
  }
};

module.exports = authMiddleware;
