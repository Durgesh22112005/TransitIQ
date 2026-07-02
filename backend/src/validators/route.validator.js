// =============================================================
// src/validators/route.validator.js
// =============================================================

const { body } = require('express-validator');

const createRouteValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Route name is required.')
    .isLength({ max: 100 }).withMessage('Route name must not exceed 100 characters.'),

  body('routeNo')
    .trim()
    .notEmpty().withMessage('Route number is required.')
    .isLength({ max: 20 }).withMessage('Route number must not exceed 20 characters.'),

  body('startLocation')
    .trim()
    .notEmpty().withMessage('Start location is required.'),

  body('endLocation')
    .trim()
    .notEmpty().withMessage('End location is required.'),

  body('distance')
    .optional()
    .isFloat({ min: 0 }).withMessage('Distance must be a positive number.'),

  body('duration')
    .optional()
    .isInt({ min: 1 }).withMessage('Duration must be a positive integer (minutes).'),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'UNDER_REVIEW'])
    .withMessage('Status must be ACTIVE, INACTIVE, or UNDER_REVIEW.'),
];

const updateRouteValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Route name must not exceed 100 characters.'),

  body('routeNo')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Route number must not exceed 20 characters.'),

  body('startLocation').optional().trim(),
  body('endLocation').optional().trim(),

  body('distance')
    .optional()
    .isFloat({ min: 0 }).withMessage('Distance must be a positive number.'),

  body('duration')
    .optional()
    .isInt({ min: 1 }).withMessage('Duration must be a positive integer (minutes).'),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'UNDER_REVIEW'])
    .withMessage('Status must be ACTIVE, INACTIVE, or UNDER_REVIEW.'),
];

module.exports = { createRouteValidator, updateRouteValidator };
