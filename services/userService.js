import api from './api';
import { API_ENDPOINTS } from './api';

/**
 * Service for user-related API operations
 */
const userService = {
  /**
   * Get the current user's profile
   * @returns {Promise<Object>} User profile data
   */
  getUserProfile: async () => {
    const response = await api.get(API_ENDPOINTS.USER_PROFILE);
    return response.data;
  },
  
  /**
   * Update the user's profile information
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user profile data
   */
  updateUserProfile: async (userData) => {
    const response = await api.put(API_ENDPOINTS.USER_PROFILE, userData);
    return response.data;
  },
  
  /**
   * Update user settings (language, dark mode, etc.)
   * @param {Object} settings - Settings to update
   * @returns {Promise<Object>} Updated settings
   */
  updateUserSettings: async (settings) => {
    const response = await api.put(API_ENDPOINTS.USER_SETTINGS, settings);
    return response.data;
  },
  
  /**
   * Get user's activity history
   * @returns {Promise<Object>} User activity history
   */
  getUserActivities: async () => {
    const response = await api.get(API_ENDPOINTS.MY_ACTIVITIES);
    return response.data;
  },
  
  /**
   * Change user password
   * @param {Object} passwordData - Object containing current and new passwords
   * @returns {Promise<Object>} Result of password change operation
   */
  changePassword: async (passwordData) => {
    const response = await api.put(`${API_ENDPOINTS.USER_PROFILE}/password`, passwordData);
    return response.data;
  },
  
  /**
   * Update notification preferences
   * @param {Object} notificationPreferences - Notification settings
   * @returns {Promise<Object>} Updated notification preferences
   */
  updateNotificationPreferences: async (notificationPreferences) => {
    const response = await api.put(`${API_ENDPOINTS.USER_SETTINGS}/notifications`, notificationPreferences);
    return response.data;
  },
  
  /**
   * Get user's login history
   * @returns {Promise<Object>} Login history
   */
  getLoginHistory: async () => {
    const response = await api.get(`${API_ENDPOINTS.USER_PROFILE}/login-history`);
    return response.data;
  },
  
  /**
   * Upload a profile picture
   * @param {FormData} formData - Form data containing the image file
   * @returns {Promise<Object>} Updated user profile with new image URL
   */
  uploadProfilePicture: async (formData) => {
    const response = await api.post(`${API_ENDPOINTS.USER_PROFILE}/picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  /**
   * Delete user account (with confirmation)
   * @param {Object} confirmationData - Data to confirm account deletion
   * @returns {Promise<Object>} Result of account deletion operation
   */
  deleteAccount: async (confirmationData) => {
    const response = await api.post(`${API_ENDPOINTS.USER_PROFILE}/delete`, confirmationData);
    return response.data;
  }
};

export default userService;