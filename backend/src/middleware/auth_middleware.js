const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretagroguardkey123!@#');
      req.user = decoded;
      return next();
    } catch (error) {
      logger.warn('Token validation failed', { error: error.message });
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    logger.warn('Auth header missing token');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

module.exports = { protect };
