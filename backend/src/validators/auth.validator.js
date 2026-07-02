// =============================================================
// src/validators/auth.validator.js
// express-validator rules for auth routes
// =============================================================

const { body } = require('express-validator');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/\d/).withMessage('Password must contain at least one number.'),

  body('role')
    .optional()
    .isIn(['ADMIN', 'DRIVER', 'PASSENGER'])
    .withMessage('Role must be ADMIN, DRIVER, or PASSENGER.'),

  body('phone')
    .optional()
    .isMobilePhone().withMessage('Must be a valid phone number.'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

module.exports = { registerValidator, loginValidator };
