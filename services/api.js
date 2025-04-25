// services/api.js
import axios from 'axios';
import { Platform } from 'react-native';
import tokenManager from '../lib/utils/tokenManager';

// Determine the correct base URL based on platform
export let API_BASE_URL = 'http://localhost:3000/api';
if (Platform.OS === 'android') {
  // Android emulator needs a special IP to reach the host machine
  API_BASE_URL = 'http://10.0.2.2:3000/api';
} else if (Platform.OS === 'ios') {
  // Physical devices need your computer's IP
  API_BASE_URL = 'http://192.168.68.118:3000/api';
}

// Set API base URL in token manager
tokenManager.setApiBaseUrl(API_BASE_URL);

console.log(`API configured with base URL: ${API_BASE_URL}`);

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Initialize the token manager
let isInitialized = false;
export const initializeApi = async () => {
  if (isInitialized) return;
  
  await tokenManager.initialize();
  isInitialized = true;
};

// Add request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Skip adding token for auth endpoints except token refresh
      const isAuthEndpoint = config.url.includes('/auth/');
      const isTokenRefresh = config.url.includes('/auth/refresh-token');
      
      if (isAuthEndpoint && !isTokenRefresh) {
        return config;
      }
      
      // Get valid access token (will refresh if needed)
      try {
        const accessToken = await tokenManager.getValidAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (tokenError) {
        // If we can't get a valid token, proceed without it
        // The request will likely fail with 401, but interceptor shouldn't block it
        console.log('Failed to get valid token for request:', tokenError.message);
      }
      
      // Log request details for debugging
      console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
      
      return config;
    } catch (error) {
      console.error('API interceptor error:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`API Response (${response.status}): ${response.config.url}`);
    return response;
  },
  async (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error detected:', error.message);
      return Promise.reject({
        message: "Network error. Please check your internet connection.",
        status: 0,
        code: "NETWORK_ERROR",
      });
    }
    
    // Token refresh is now handled by tokenManager in the request interceptor
    // So we don't need complex refresh logic here anymore
    
    // Log errors for debugging
    console.error(`API Error (${error.response?.status}):`, error.response?.data);
    
    // Extract error details from response
    const { status, data } = error.response;
    
    // Format error object
    const formattedError = {
      message: data?.message || "An unexpected error occurred",
      status,
      code: data?.error?.code || "UNKNOWN_ERROR",
      details: data?.error?.details || {},
    };
    
    return Promise.reject(formattedError);
  }
);

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  
  // User endpoints
  USER_PROFILE: '/users/profile',
  USER_SETTINGS: '/users/settings',
  
  // Restaurant endpoints
  RESTAURANT_HOURS: '/restaurant/hours',
  DAILY_MENU: '/restaurant/menu',
  WEEKLY_MENU: '/restaurant/menu/weekly',
  
  // Activities endpoints
  ACTIVITIES: '/activities',
  WEEKLY_ACTIVITIES: '/activities/weekly',
  ACTIVITY_DETAILS: (id) => `/activities/${id}`,
  REGISTER_ACTIVITY: (id) => `/activities/${id}/register`,
  MY_ACTIVITIES: '/activities/my-activities',
  
  // Messages endpoints
  MESSAGES: '/messages',
  MESSAGE_DETAILS: (id) => `/messages/${id}`,
  MARK_MESSAGE_READ: (id) => `/messages/${id}/read`,
  
  // Medical endpoints
  MEDICAL_APPOINTMENTS: '/medical/appointments',
  MEDICAL_APPOINTMENT_DETAILS: (id) => `/medical/appointments/${id}`,
  MEDICAL_RECORDS: '/medical/records',
  
  // Pool endpoints
  POOL_HOURS: '/pool/hours',
};

export default api;