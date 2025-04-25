// utils/tokenManager.js
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import  jwtDecode  from 'jwt-decode';

// Constants for token storage
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_EXPIRY_BUFFER = 30 * 1000; // 30 seconds buffer before expiration

// Helper class for secure token storage with fallback
class TokenStorage {
  /**
   * Store a value securely
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {Promise<void>}
   */
  static async setItem(key, value) {
    if (!value) return;
    
    try {
      // Try SecureStore first (more secure)
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(key, value);
      } else {
        // Fallback for web
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn(`Failed to store ${key} securely, falling back to AsyncStorage`);
      // Fall back to AsyncStorage
      await AsyncStorage.setItem(key, value);
    }
  }
  
  /**
   * Retrieve a value from secure storage
   * @param {string} key - Storage key
   * @returns {Promise<string|null>} - Retrieved value or null
   */
  static async getItem(key) {
    try {
      // Try SecureStore first
      if (Platform.OS !== 'web') {
        return await SecureStore.getItemAsync(key);
      } else {
        // Fallback for web
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.warn(`Failed to get ${key} from SecureStore, trying AsyncStorage`);
      // Fall back to AsyncStorage
      return await AsyncStorage.getItem(key);
    }
  }
  
  /**
   * Remove a value from secure storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  static async removeItem(key) {
    try {
      // Try SecureStore first
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(key);
      } else {
        // Fallback for web
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Failed to remove ${key} from SecureStore, trying AsyncStorage`);
      // Fall back to AsyncStorage
      await AsyncStorage.removeItem(key);
    }
  }
}

/**
 * JWT Token Manager - Handles token storage, refresh, and validation
 * Implements secure token rotation pattern
 */
class TokenManager {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.accessTokenExpiry = null;
    this.refreshTokenExpiry = null;
    this.refreshing = false;
    this.refreshQueue = [];
    this.apiBaseUrl = null;
    this.observers = [];
  }
  
  /**
   * Set the API base URL
   * @param {string} baseUrl - API base URL
   */
  setApiBaseUrl(baseUrl) {
    this.apiBaseUrl = baseUrl;
  }
  
  /**
   * Initialize by loading tokens from storage
   * @returns {Promise<Object>} - Token status
   */
  async initialize() {
    const accessToken = await TokenStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = await TokenStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (accessToken) {
      this.setAccessToken(accessToken);
    }
    
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
    
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      isValid: this.isAccessTokenValid()
    };
  }
  
  /**
   * Parse and store access token
   * @param {string} token - JWT access token
   */
  setAccessToken(token) {
    if (!token) {
      this.accessToken = null;
      this.accessTokenExpiry = null;
      return;
    }
    
    this.accessToken = token;
    
    try {
      const decoded = this.decodeToken(token);
      this.accessTokenExpiry = decoded.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Failed to decode access token:', error);
      this.accessTokenExpiry = null;
    }
    
    // Notify observers
    this.notifyObservers();
  }
  
  /**
   * Parse and store refresh token
   * @param {string} token - JWT refresh token
   */
  setRefreshToken(token) {
    if (!token) {
      this.refreshToken = null;
      this.refreshTokenExpiry = null;
      return;
    }
    
    this.refreshToken = token;
    
    try {
      const decoded = this.decodeToken(token);
      this.refreshTokenExpiry = decoded.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Failed to decode refresh token:', error);
      this.refreshTokenExpiry = null;
    }
    
    // Notify observers
    this.notifyObservers();
  }
  
  /**
   * Store both tokens in memory and persistent storage
   * @param {string} accessToken - JWT access token
   * @param {string} refreshToken - JWT refresh token
   * @returns {Promise<Object>} - Stored tokens
   */
  async setTokens(accessToken, refreshToken) {
    if (accessToken) {
      this.setAccessToken(accessToken);
      await TokenStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
      await TokenStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken
    };
  }
  
  /**
   * Get current tokens
   * @returns {Object} - Current tokens and expiry times
   */
  getTokens() {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      accessTokenExpiry: this.accessTokenExpiry,
      refreshTokenExpiry: this.refreshTokenExpiry
    };
  }
  
  /**
   * Clear all tokens from memory and storage
   * @returns {Promise<boolean>} - Success indicator
   */
  async clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.accessTokenExpiry = null;
    this.refreshTokenExpiry = null;
    
    await TokenStorage.removeItem(ACCESS_TOKEN_KEY);
    await TokenStorage.removeItem(REFRESH_TOKEN_KEY);
    
    // Notify observers
    this.notifyObservers();
    
    return true;
  }
  
  /**
   * Check if access token is valid and not expired
   * @returns {boolean} - Token validity status
   */
  isAccessTokenValid() {
    if (!this.accessToken || !this.accessTokenExpiry) {
      return false;
    }
    
    // Add buffer time to prevent edge cases
    return Date.now() < (this.accessTokenExpiry - TOKEN_EXPIRY_BUFFER);
  }
  
  /**
   * Check if refresh token is valid and not expired
   * @returns {boolean} - Token validity status
   */
  isRefreshTokenValid() {
    if (!this.refreshToken || !this.refreshTokenExpiry) {
      return false;
    }
    
    return Date.now() < this.refreshTokenExpiry;
  }
  
  /**
   * Get a valid access token, refreshing if needed
   * @returns {Promise<string>} - Valid access token
   * @throws {Error} - If token cannot be refreshed
   */
  async getValidAccessToken() {
    // If access token is valid, return it
    if (this.isAccessTokenValid()) {
      return this.accessToken;
    }
    
    // If refresh token is invalid, can't refresh
    if (!this.isRefreshTokenValid()) {
      throw new Error('Authentication expired. Please log in again.');
    }
    
    // If another refresh is already in progress, wait for it
    if (this.refreshing) {
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }
    
    // Start refresh process
    this.refreshing = true;
    
    try {
      const result = await this.refreshTokens();
      
      // Process queue
      this.refreshQueue.forEach(promise => {
        promise.resolve(result.accessToken);
      });
      
      return result.accessToken;
    } catch (error) {
      // Notify all waiting promises of the error
      this.refreshQueue.forEach(promise => {
        promise.reject(error);
      });
      
      throw error;
    } finally {
      this.refreshing = false;
      this.refreshQueue = [];
    }
  }
  
  /**
   * Refresh tokens using the refresh token
   * @returns {Promise<Object>} - New tokens
   * @throws {Error} - If refresh fails
   */
  async refreshTokens() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    if (!this.apiBaseUrl) {
      throw new Error('API base URL not set. Call setApiBaseUrl first.');
    }
    
    try {
      // Use direct axios to avoid interceptor loop
      const response = await axios.post(`${this.apiBaseUrl}/auth/refresh-token`, {
        refreshToken: this.refreshToken
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      const { accessToken, refreshToken } = response.data;
      
      // Update tokens in memory and storage
      await this.setTokens(accessToken, refreshToken);
      
      return {
        success: true,
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Clear tokens on refresh failure
      await this.clearTokens();
      
      throw new Error('Session expired. Please log in again.');
    }
  }
  
  /**
   * Add observer for token changes
   * @param {Function} callback - Observer callback
   * @returns {Function} - Unsubscribe function
   */
  addObserver(callback) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(observer => observer !== callback);
    };
  }
  
  /**
   * Notify all observers of token changes
   */
  notifyObservers() {
    const tokenInfo = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      isValid: this.isAccessTokenValid()
    };
    
    this.observers.forEach(callback => {
      try {
        callback(tokenInfo);
      } catch (error) {
        console.error('Observer error:', error);
      }
    });
  }
  
  /**
   * Decode a JWT token without external dependencies
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  decodeToken(token) {
    try {
      // Try to use jwt-decode if available
      if (typeof jwtDecode === 'function') {
        return jwtDecode(token);
      }
      
      // Manual decoding
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      let jsonPayload;
      if (typeof Buffer !== 'undefined') {
        // Node.js or React Native with buffer polyfill
        jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
      } else {
        // Browser environment
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        jsonPayload = new TextDecoder().decode(bytes);
      }
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Token decode error:', error);
      throw new Error('Invalid token format');
    }
  }
}

// Export singleton instance
const tokenManager = new TokenManager();
export default tokenManager;