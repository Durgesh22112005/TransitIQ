// =============================================================
// src/routes/stop.routes.js
// =============================================================

const { Router } = require('express');
const {
  getAllStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
} = require('../controllers/stop.controller');
const { createStopValidator, updateStopValidator } = require('../validators/stop.validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate, authorise } = require('../middleware/auth.middleware');

const router = Router();

router.use(authenticate);

router
  .route('/')
  .get(getAllStops)
  .post(authorise('ADMIN'), createStopValidator, validate, createStop);

router
  .route('/:id')
  .get(getStopById)
  .put(authorise('ADMIN'), updateStopValidator, validate, updateStop)
  .delete(authorise('ADMIN'), deleteStop);

module.exports = router;
