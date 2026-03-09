const express = require('express');
const router = express.Router();
const {
  postRide,
  getMyRides,
  getActiveRides,
  cancelRide,
} = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

// All ride routes are protected
router.use(protect);

// @route   POST /api/rides
router.post('/', postRide);

// @route   GET /api/rides/my
router.get('/my', getMyRides);

// @route   GET /api/rides/active
router.get('/active', getActiveRides);

// @route   PUT /api/rides/:id/cancel
router.put('/:id/cancel', cancelRide);

module.exports = router;