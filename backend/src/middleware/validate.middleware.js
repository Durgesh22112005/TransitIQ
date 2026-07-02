// =============================================================
// src/middleware/validate.middleware.js
// Reads express-validator results and returns 422 on failure
// =============================================================

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response.util');

/**
 * validate – middleware that checks express-validator errors.
 * Place this after your validator chain in route definitions.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      'Validation failed.',
      422,
      errors.array().map((e) => ({ field: e.path, message: e.msg }))
    );
  }
  next();
};

module.exports = { validate };
