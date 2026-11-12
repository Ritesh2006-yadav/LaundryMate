import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/staff';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staff_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors gracefully
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('staff_token');
      localStorage.removeItem('staff_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1';
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to connect to the server. Please try again.';

    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
