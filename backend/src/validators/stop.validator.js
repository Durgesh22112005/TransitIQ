// =============================================================
// src/validators/stop.validator.js
// =============================================================

const { body } = require('express-validator');

const createStopValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Stop name is required.')
    .isLength({ max: 100 }).withMessage('Stop name must not exceed 100 characters.'),

  body('routeId')
    .notEmpty().withMessage('routeId is required.')
    .isUUID().withMessage('routeId must be a valid UUID.'),

  body('sequence')
    .notEmpty().withMessage('Sequence is required.')
    .isInt({ min: 1 }).withMessage('Sequence must be a positive integer.'),

  body('landmark')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Landmark must not exceed 150 characters.'),
];

const updateStopValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Stop name must not exceed 100 characters.'),

  body('sequence')
    .optional()
    .isInt({ min: 1 }).withMessage('Sequence must be a positive integer.'),

  body('landmark')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('Landmark must not exceed 150 characters.'),
];

module.exports = { createStopValidator, updateStopValidator };
