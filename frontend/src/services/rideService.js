import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5000/api/rides';

// Get auth header with JWT token
const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${authService.getToken()}`
  }
});

// Post a new ride
const postRide = async (rideData) => {
  const response = await axios.post(API_URL, rideData, getAuthHeader());
  return response.data;
};

// Get my rides
const getMyRides = async () => {
  const response = await axios.get(`${API_URL}/my`, getAuthHeader());
  return response.data;
};

// Get all active rides
const getActiveRides = async () => {
  const response = await axios.get(`${API_URL}/active`, getAuthHeader());
  return response.data;
};

// Cancel a ride
const cancelRide = async (rideId) => {
  const response = await axios.put(`${API_URL}/${rideId}/cancel`, {}, getAuthHeader());
  return response.data;
};

const rideService = { postRide, getMyRides, getActiveRides, cancelRide };

export default rideService;