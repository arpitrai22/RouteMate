const Ride = require('../models/Ride');

// ─────────────────────────────────────────
// @route   POST /api/rides
// @desc    Post a new ride intent
// @access  Private
// ─────────────────────────────────────────
const postRide = async (req, res) => {
  try {
    const {
      sourceLat,
      sourceLng,
      sourceName,
      destinationLat,
      destinationLng,
      destinationName,
      departureTime,
      seats,
      note,
    } = req.body;

    // Validate required fields
    if (!sourceLat || !sourceLng || !sourceName ||
        !destinationLat || !destinationLng || !destinationName ||
        !departureTime || !seats) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Check if user already has an active ride
    const existingRide = await Ride.findOne({
      user: req.user._id,
      status: 'active'
    });

    if (existingRide) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active ride. Cancel it before posting a new one.'
      });
    }

    // Create new ride
    const ride = await Ride.create({
      user: req.user._id,
      sourceLat,
      sourceLng,
      sourceName,
      destinationLat,
      destinationLng,
      destinationName,
      departureTime,
      seats,
      note: note || '',
    });

    res.status(201).json({
      success: true,
      message: 'Ride posted successfully!',
      ride,
    });

  } catch (error) {
    console.error('Post ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/rides/my
// @desc    Get all rides of logged in user
// @access  Private
// ─────────────────────────────────────────
const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      rides,
    });

  } catch (error) {
    console.error('Get my rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/rides/active
// @desc    Get all active rides (for matching)
// @access  Private
// ─────────────────────────────────────────
const getActiveRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      status: 'active',
      user: { $ne: req.user._id }, // Exclude current user's rides
      departureTime: { $gte: new Date() }, // Only future rides
    })
      .populate('user', 'name totalRides streak')
      .sort({ departureTime: 1 });

    res.status(200).json({
      success: true,
      rides,
    });

  } catch (error) {
    console.error('Get active rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/rides/:id/cancel
// @desc    Cancel a ride
// @access  Private
// ─────────────────────────────────────────
const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if ride belongs to logged in user
    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this ride'
      });
    }

    // Check if ride is already cancelled
    if (ride.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Ride is already cancelled'
      });
    }

    ride.status = 'cancelled';
    await ride.save();

    res.status(200).json({
      success: true,
      message: 'Ride cancelled successfully',
      ride,
    });

  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

module.exports = { postRide, getMyRides, getActiveRides, cancelRide };