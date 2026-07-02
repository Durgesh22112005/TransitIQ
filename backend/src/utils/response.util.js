// =============================================================
// src/utils/response.util.js
// Standardised API response helpers
// =============================================================

/**
 * Send a successful response
 * @param {object} res  - Express response object
 * @param {*}      data - Payload to send
 * @param {string} message
 * @param {number} statusCode - HTTP status (default 200)
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {object} res
 * @param {string} message
 * @param {number} statusCode - HTTP status (default 400)
 * @param {*}      errors     - Optional validation errors
 */
const sendError = (res, message = 'Error', statusCode = 400, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

module.exports = { sendSuccess, sendError };
