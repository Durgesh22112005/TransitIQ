// =============================================================
// src/middleware/error.middleware.js
// Global error handler – must be registered last in Express
// =============================================================

const { NODE_ENV } = require('../config/env');

/**
 * notFound – 404 handler for unmatched routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * globalErrorHandler – catches all errors forwarded via next(err)
 * Shows stack trace only in development.
 */
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${statusCode} – ${message}`);
  if (NODE_ENV === 'development') {
    console.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, globalErrorHandler };
