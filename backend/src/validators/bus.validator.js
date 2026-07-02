// =============================================================
// src/validators/bus.validator.js
// =============================================================

const { body } = require('express-validator');

const createBusValidator = [
  body('regNo')
    .trim()
    .notEmpty().withMessage('Registration number is required.')
    .isLength({ min: 3, max: 20 }).withMessage('Registration number must be 3–20 characters.'),

  body('model')
    .trim()
    .notEmpty().withMessage('Bus model is required.')
    .isLength({ max: 60 }).withMessage('Model name must not exceed 60 characters.'),

  body('capacity')
    .notEmpty().withMessage('Capacity is required.')
    .isInt({ min: 1, max: 200 }).withMessage('Capacity must be between 1 and 200.'),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'MAINTENANCE'])
    .withMessage('Status must be ACTIVE, INACTIVE, or MAINTENANCE.'),
];

const updateBusValidator = [
  body('regNo')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Registration number must be 3–20 characters.'),

  body('model')
    .optional()
    .trim()
    .isLength({ max: 60 }).withMessage('Model name must not exceed 60 characters.'),

  body('capacity')
    .optional()
    .isInt({ min: 1, max: 200 }).withMessage('Capacity must be between 1 and 200.'),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'MAINTENANCE'])
    .withMessage('Status must be ACTIVE, INACTIVE, or MAINTENANCE.'),
];

module.exports = { createBusValidator, updateBusValidator };
