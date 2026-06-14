import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Default to dynamic EXPO_PUBLIC_API_URL or Android emulator loopback alias (10.0.2.2)
const DEFAULT_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000';

export const api = axios.create({
  baseURL: DEFAULT_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject JWT tokens into headers if the user is logged in
api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response intercepts for handling common HTTP errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  }
);

export default api;
