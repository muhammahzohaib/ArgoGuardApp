const logger = require('../utils/logger');

// Global error handler middleware
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled Exception occurred: ' + err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
