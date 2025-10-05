// frontend/src/services/api.js
import axios from "axios";

// create an axios instance with baseURL pointing to your backend
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// attach JWT token automatically (if present in localStorage)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
