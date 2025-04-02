// lib/utils/tokenUtils.js
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SecureStore keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_DATA_KEY = 'userData';

/**
 * Save authentication tokens and user data
 * @param {string} accessToken - The JWT access token
 * @param {string} refreshToken - The JWT refresh token
 * @param {Object} userData - The user data to save
 * @returns {Promise<void>}
 */
export const saveAuthData = async (accessToken, refreshToken, userData) => {
  try {
    // Store tokens securely
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    
    // Store user data in AsyncStorage
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    
    return true;
  } catch (error) {
    console.error('Error saving auth data:', error);
    return false;
  }
};

/**
 * Get the stored access token
 * @returns {Promise<string|null>} The access token or null if not found
 */
export const getAccessToken = async () => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Get the stored refresh token
 * @returns {Promise<string|null>} The refresh token or null if not found
 */
export const getRefreshToken = async () => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Get the stored user data
 * @returns {Promise<Object|null>} The user data or null if not found
 */
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Clear all authentication data
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const clearAuthData = async () => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

/**
 * Update the stored access and refresh tokens
 * @param {string} accessToken - The new access token
 * @param {string} refreshToken - The new refresh token
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const updateTokens = async (accessToken, refreshToken) => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    return true;
  } catch (error) {
    console.error('Error updating tokens:', error);
    return false;
  }
};