// =============================================================
// src/routes/route.routes.js
// =============================================================

const { Router } = require('express');
const {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} = require('../controllers/route.controller');
const { createRouteValidator, updateRouteValidator } = require('../validators/route.validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate, authorise } = require('../middleware/auth.middleware');

const router = Router();

router.use(authenticate);

router
  .route('/')
  .get(getAllRoutes)
  .post(authorise('ADMIN'), createRouteValidator, validate, createRoute);

router
  .route('/:id')
  .get(getRouteById)
  .put(authorise('ADMIN'), updateRouteValidator, validate, updateRoute)
  .delete(authorise('ADMIN'), deleteRoute);

module.exports = router;
