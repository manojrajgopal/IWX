import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
  withCredentials: true, // Enable credentials for CORS
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Request interceptor for adding auth token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and retries
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config, response, request } = error;

    // Enhanced retry logic for network errors, CORS errors, and 5xx errors
    if (config && !config._retry && (
      !response || // Network error
      response.status === 0 || // CORS/network error
      (response.status >= 500 && response.status < 600) // Server errors
    )) {
      config._retry = true;
      config._retryCount = (config._retryCount || 0) + 1;

      if (config._retryCount < MAX_RETRIES) {
        console.log(`Retrying request (${config._retryCount}/${MAX_RETRIES}): ${config.url}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * config._retryCount));
        return axiosClient(config);
      }
    }

    if (response) {
      // Server responded with error status
      const { status, data } = response;

      switch (status) {
        case 401:
          localStorage.removeItem('token');
          window.location.href = '/auth';
          break;
        case 403:
          console.error('Access forbidden:', data?.error?.message || 'Forbidden');
          break;
        case 404:
          // Don't log 404 errors to console as they're handled by components
          break;
        case 500:
          console.error('Server error:', data?.error?.message || 'Internal server error');
          break;
        default:
          console.error(`HTTP ${status} error:`, data?.error?.message || 'Unknown error');
      }
    } else if (request) {
      // Network error (connection failed)
      console.error('Network error: Unable to connect to server. Please check your internet connection and server status.');
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
