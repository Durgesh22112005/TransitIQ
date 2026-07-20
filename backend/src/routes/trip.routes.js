const { Router } = require('express');
const {
  getAllTrips,
  getCurrentTrip,
  getActiveTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  startTrip,
  endTrip,
} = require('../controllers/trip.controller');
const { authenticate, authorise } = require('../middleware/auth.middleware');

const router = Router();

router.use(authenticate);

// Specific routes BEFORE /:id to avoid param capture
router.get('/active',  getActiveTrips);
router.get('/current', getCurrentTrip);

// Admin CRUD
router.route('/')
  .get(authorise('ADMIN'), getAllTrips)
  .post(authorise('ADMIN'), createTrip);

// Any authenticated user can view a trip by ID
router.get('/:id', getTripById);

router.route('/:id')
  .put(authorise('ADMIN'), updateTrip)
  .delete(authorise('ADMIN'), deleteTrip);

// Driver actions
router.post('/:id/start', startTrip);
router.post('/:id/end', endTrip);

module.exports = router;
