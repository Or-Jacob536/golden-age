// services/authService.js
import axios from 'axios';
import api, { API_ENDPOINTS, API_BASE_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tokenManager from '../lib/utils/tokenManager';

/**
 * Login user with email/username and password
 * @param {string} identifier - Email or username
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response with tokens and user data
 */
export const login = async (identifier, password) => {
  try {
    const response = await api.post(API_ENDPOINTS.LOGIN, {
      identifier,
      password,
    });
    
    // Store tokens in token manager
    await tokenManager.setTokens(
      response.data.accessToken,
      response.data.refreshToken
    );
    
    // Store user data
    await AsyncStorage.setItem("userData", JSON.stringify(response.data.user));
    
    return {
      success: true,
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      user: response.data.user,
    };
  } catch (error) {
    console.error('Login service error:', error);
    return {
      success: false,
      message: error.message || 'Failed to log in. Please check your credentials.',
    };
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response
 */
export const register = async (userData) => {
  try {
    const response = await api.post(API_ENDPOINTS.REGISTER, userData);
    
    return {
      success: true,
      message: response.data.message || 'Registration successful',
    };
  } catch (error) {
    console.error('Registration service error:', error);
    
    // Handle validation errors
    if (error.status === 400 && error.details) {
      const validationErrors = Object.values(error.details).join(', ');
      return {
        success: false,
        message: validationErrors || 'Validation failed',
        validationErrors: error.details,
      };
    }
    
    return {
      success: false,
      message: error.message || 'Registration failed',
    };
  }
};

/**
 * Logout user
 * @returns {Promise<Object>} Logout response
 */
export const logout = async () => {
  // Get refresh token before clearing
  const { refreshToken } = tokenManager.getTokens();
  
  // First clear all tokens to ensure local logout
  await tokenManager.clearTokens();
  await AsyncStorage.removeItem('userData');
  
  // If no refresh token, just return success (already logged out)
  if (!refreshToken) {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
  
  // Notify server in background (don't wait for response)
  try {
    // Use direct axios to avoid interceptors
    const logoutClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // shorter timeout for logout
    });
    
    // Fire and forget
    logoutClient.post(`${API_BASE_URL}/auth/logout`, { refreshToken })
      .then(() => console.log('Server notified of logout'))
      .catch(e => console.log('Server notification of logout failed:', e.message));
    
    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    console.error('Logout service error:', error);
    
    // Even if there's an error, the user is still logged out locally
    return {
      success: true, 
      message: 'Logged out locally',
    };
  }
};

/**
 * Request password reset
 * @param {string} identifier - Email or username
 * @returns {Promise<Object>} Password reset request response
 */
export const forgotPassword = async (identifier) => {
  try {
    const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { identifier });
    
    return {
      success: true,
      message: response.data.message || 'Password reset link sent to your email',
    };
  } catch (error) {
    console.error('Forgot password service error:', error);
    return {
      success: false,
      message: error.message || 'Failed to process password reset request',
    };
  }
};

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Password reset response
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post(API_ENDPOINTS.RESET_PASSWORD, {
      token,
      newPassword,
    });
    
    return {
      success: true,
      message: response.data.message || 'Password reset successful',
    };
  } catch (error) {
    console.error('Reset password service error:', error);
    return {
      success: false,
      message: error.message || 'Failed to reset password',
    };
  }
};

/**
 * Get the current authentication status
 * @returns {Promise<Object>} Auth status
 */
export const getAuthStatus = async () => {
  try {
    await tokenManager.initialize();
    
    const tokens = tokenManager.getTokens();
    const isAccessTokenValid = tokenManager.isAccessTokenValid();
    const isRefreshTokenValid = tokenManager.isRefreshTokenValid();
    
    // Get user data if available
    let userData = null;
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        userData = JSON.parse(userDataStr);
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
    
    return {
      isLoggedIn: isAccessTokenValid || isRefreshTokenValid,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenValid: isAccessTokenValid,
      refreshTokenValid: isRefreshTokenValid,
      userData
    };
  } catch (error) {
    console.error('Get auth status error:', error);
    return {
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      accessTokenValid: false,
      refreshTokenValid: false,
      userData: null
    };
  }
};