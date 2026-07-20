// =============================================================
// src/routes/auth.routes.js
// =============================================================

const { Router } = require('express');
const { register, login, getMe, getUsers } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate, authorise } = require('../middleware/auth.middleware');

const router = Router();

// POST /api/v1/auth/register
router.post('/register', registerValidator, validate, register);

// POST /api/v1/auth/login
router.post('/login', loginValidator, validate, login);

// GET /api/v1/auth/me  (protected)
router.get('/me', authenticate, getMe);

// GET /api/v1/auth/users  (admin only)
router.get('/users', authenticate, authorise('ADMIN'), getUsers);

module.exports = router;
