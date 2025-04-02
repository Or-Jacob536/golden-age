// utils/tokenManager.js
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Helper function to decide where to store tokens
// Uses SecureStore when available, falls back to AsyncStorage
const tokenStorage = {
  async getItem(key) {
    try {
      // Try SecureStore first (more secure)
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      // Fall back to AsyncStorage
      console.log('Falling back to AsyncStorage for token storage');
      return await AsyncStorage.getItem(key);
    }
  },
  
  async setItem(key, value) {
    try {
      // Try SecureStore first
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      // Fall back to AsyncStorage
      console.log('Falling back to AsyncStorage for token storage');
      await AsyncStorage.setItem(key, value);
    }
  },
  
  async removeItem(key) {
    try {
      // Try SecureStore first
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      // Fall back to AsyncStorage
      await AsyncStorage.removeItem(key);
    }
  }
};

// Parse JWT token without using jwt-decode
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // In React Native, we need to use a different approach than atob
    // as it's not available in all environments
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

// Token manager class
class TokenManager {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.accessTokenExpiry = null;
    this.refreshTokenExpiry = null;
    this.refreshing = false; // Track if refresh is in progress
    this.refreshQueue = []; // Queue of promises waiting for refresh
    this.apiBaseUrl = null; // Will be set by setApiBaseUrl
    
    // Observer pattern for token changes
    this.observers = [];
  }
  
  // Set the API base URL (to be called from api.js)
  setApiBaseUrl(baseUrl) {
    this.apiBaseUrl = baseUrl;
  }
  
  // Initialize by loading tokens from storage
  async initialize() {
    const accessToken = await tokenStorage.getItem('accessToken');
    const refreshToken = await tokenStorage.getItem('refreshToken');
    
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
  
  // Parse and store access token
  setAccessToken(token) {
    if (!token) {
      this.accessToken = null;
      this.accessTokenExpiry = null;
      return;
    }
    
    this.accessToken = token;
    
    try {
      const decoded = parseJwt(token);
      this.accessTokenExpiry = decoded.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Failed to decode access token:', error);
      this.accessTokenExpiry = null;
    }
    
    // Notify observers
    this.notifyObservers();
  }
  
  // Parse and store refresh token
  setRefreshToken(token) {
    if (!token) {
      this.refreshToken = null;
      this.refreshTokenExpiry = null;
      return;
    }
    
    this.refreshToken = token;
    
    try {
      const decoded = parseJwt(token);
      this.refreshTokenExpiry = decoded.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Failed to decode refresh token:', error);
      this.refreshTokenExpiry = null;
    }
    
    // Notify observers
    this.notifyObservers();
  }
  
  // Store both tokens in memory and persistent storage
  async setTokens(accessToken, refreshToken) {
    if (accessToken) {
      this.setAccessToken(accessToken);
      await tokenStorage.setItem('accessToken', accessToken);
    }
    
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
      await tokenStorage.setItem('refreshToken', refreshToken);
    }
    
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken
    };
  }
  
  // Get current tokens
  getTokens() {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      accessTokenExpiry: this.accessTokenExpiry,
      refreshTokenExpiry: this.refreshTokenExpiry
    };
  }
  
  // Clear all tokens
  async clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.accessTokenExpiry = null;
    this.refreshTokenExpiry = null;
    
    await tokenStorage.removeItem('accessToken');
    await tokenStorage.removeItem('refreshToken');
    
    // Notify observers
    this.notifyObservers();
    
    return true;
  }
  
  // Check if access token is valid and not expired
  isAccessTokenValid() {
    if (!this.accessToken || !this.accessTokenExpiry) {
      return false;
    }
    
    // Add a 30-second buffer to prevent edge cases
    const bufferTime = 30 * 1000; // 30 seconds in milliseconds
    return Date.now() < (this.accessTokenExpiry - bufferTime);
  }
  
  // Check if refresh token is valid and not expired
  isRefreshTokenValid() {
    if (!this.refreshToken || !this.refreshTokenExpiry) {
      return false;
    }
    
    return Date.now() < this.refreshTokenExpiry;
  }
  
  // Get access token (refreshing if needed)
  async getValidAccessToken() {
    // If access token is valid, return it
    if (this.isAccessTokenValid()) {
      return this.accessToken;
    }
    
    // If refresh token is invalid, can't refresh
    if (!this.isRefreshTokenValid()) {
      throw new Error('Refresh token invalid or expired');
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
  
  // Refresh tokens using the refresh token
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
      
      throw error;
    }
  }
  
  // Add observer for token changes
  addObserver(callback) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(observer => observer !== callback);
    };
  }
  
  // Notify all observers of token changes
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
}

// Export singleton instance
const tokenManager = new TokenManager();
export default tokenManager;