import axios from 'axios';

// IMPORTANT: For local testing on Android Emulator, localhost is 10.0.2.2.
// For Expo Go on a physical device, it must be the actual IP address of the dev machine (e.g., http://192.168.1.5:5000).
const BASE_URL = 'http://10.0.2.2:5000'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    // Later we can implement token retrieval from SecureStore/AsyncStorage here
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
