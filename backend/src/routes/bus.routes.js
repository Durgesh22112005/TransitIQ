// =============================================================
// src/routes/bus.routes.js
// =============================================================

const { Router } = require('express');
const {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
} = require('../controllers/bus.controller');
const { createBusValidator, updateBusValidator } = require('../validators/bus.validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate, authorise } = require('../middleware/auth.middleware');

const router = Router();

router.use(authenticate);

router
  .route('/')
  .get(getAllBuses)
  .post(authorise('ADMIN'), createBusValidator, validate, createBus);

router
  .route('/:id')
  .get(getBusById)
  .put(authorise('ADMIN'), updateBusValidator, validate, updateBus)
  .delete(authorise('ADMIN'), deleteBus);

module.exports = router;
