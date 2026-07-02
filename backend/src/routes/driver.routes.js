// =============================================================
// src/routes/driver.routes.js
// =============================================================

const { Router } = require('express');
const {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} = require('../controllers/driver.controller');
const {
  createDriverValidator,
  updateDriverValidator,
} = require('../validators/driver.validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate, authorise } = require('../middleware/auth.middleware');

const router = Router();

// All driver routes require authentication
router.use(authenticate);

router
  .route('/')
  .get(getAllDrivers)                                           // Any authenticated user
  .post(authorise('ADMIN'), createDriverValidator, validate, createDriver); // ADMIN only

router
  .route('/:id')
  .get(getDriverById)                                          // Any authenticated user
  .put(authorise('ADMIN'), updateDriverValidator, validate, updateDriver)
  .delete(authorise('ADMIN'), deleteDriver);

module.exports = router;
