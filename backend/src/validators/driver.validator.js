// =============================================================
// src/validators/driver.validator.js
// =============================================================

const { body } = require('express-validator');

const createDriverValidator = [
  body('userId')
    .notEmpty().withMessage('userId is required.')
    .isUUID().withMessage('userId must be a valid UUID.'),

  body('licenseNo')
    .trim()
    .notEmpty().withMessage('License number is required.')
    .isLength({ min: 5, max: 30 }).withMessage('License number must be 5–30 characters.'),

  body('experience')
    .optional()
    .isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years.'),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'ON_LEAVE'])
    .withMessage('Status must be ACTIVE, INACTIVE, or ON_LEAVE.'),
];

const updateDriverValidator = [
  body('licenseNo')
    .optional()
    .trim()
    .isLength({ min: 5, max: 30 }).withMessage('License number must be 5–30 characters.'),

  body('experience')
    .optional()
    .isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years.'),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'ON_LEAVE'])
    .withMessage('Status must be ACTIVE, INACTIVE, or ON_LEAVE.'),

  body('assignedBusId')
    .optional({ nullable: true })
    .isUUID().withMessage('assignedBusId must be a valid UUID.'),
];

module.exports = { createDriverValidator, updateDriverValidator };
