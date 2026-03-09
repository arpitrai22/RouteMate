const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sourceLat: {
    type: Number,
    required: [true, 'Source latitude is required'],
  },
  sourceLng: {
    type: Number,
    required: [true, 'Source longitude is required'],
  },
  sourceName: {
    type: String,
    required: [true, 'Source name is required'],
  },
  destinationLat: {
    type: Number,
    required: [true, 'Destination latitude is required'],
  },
  destinationLng: {
    type: Number,
    required: [true, 'Destination longitude is required'],
  },
  destinationName: {
    type: String,
    required: [true, 'Destination name is required'],
  },
  departureTime: {
    type: Date,
    required: [true, 'Departure time is required'],
  },
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [1, 'At least 1 seat required'],
    max: [6, 'Maximum 6 seats allowed'],
  },
  status: {
    type: String,
    enum: ['active', 'matched', 'completed', 'cancelled'],
    default: 'active',
  },
  note: {
    type: String,
    default: '',
    maxlength: [200, 'Note cannot exceed 200 characters'],
  },
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);