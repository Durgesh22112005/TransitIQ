// =============================================================
// src/utils/jwt.util.js
// JWT sign / verify helpers
// =============================================================

const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

/**
 * Generate a signed JWT token for the given payload
 * @param {object} payload - Data to embed (userId, role, etc.)
 * @returns {string} Signed JWT string
 */
const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { signToken, verifyToken };
