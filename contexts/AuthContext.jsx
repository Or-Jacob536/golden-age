import React, { createContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "../services/authService";
import tokenManager from "../lib/utils/tokenManager";
import { initializeApi } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);

  // Initialize API and token manager
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Initialize API
        await initializeApi();
        
        // Get auth status
        const status = await authService.getAuthStatus();
        
        if (status.isLoggedIn && status.userData) {
          setIsLoggedIn(true);
          setUserData(status.userData);
          setTokenExpiry(tokenManager.getTokens().accessTokenExpiry);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
    
    // Set up token change listener
    const unsubscribe = tokenManager.addObserver((tokenInfo) => {
      setIsLoggedIn(tokenInfo.isValid || !!tokenInfo.refreshToken);
      setTokenExpiry(tokenManager.getTokens().accessTokenExpiry);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Login function
  const login = async (identifier, password) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await authService.login(identifier, password);
      if (response.success) {
        // Update state
        setUserData(response.user);
        setIsLoggedIn(true);
        setTokenExpiry(tokenManager.getTokens().accessTokenExpiry);

        return { success: true };
      } else {
        setAuthError(response.message || "Login failed");
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError(error.message || "Login failed");
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await authService.register(userData);

      if (response.success) {
        return { success: true };
      } else {
        setAuthError(response.message || "Registration failed");
        return { 
          success: false, 
          message: response.message,
          validationErrors: response.validationErrors 
        };
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.message || "Registration failed";
      setAuthError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    console.log("Logging out user...");
    setIsLoading(true);
    
    try {
      // Call the authService logout function
      const result = await authService.logout();
      
      // Update state
      setUserData(null);
      setIsLoggedIn(false);
      
      console.log("Logout completed successfully");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      
      // Clear state anyway
      setUserData(null);
      setIsLoggedIn(false);
      
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status (useful for re-checking token validity)
  const checkAuthStatus = useCallback(async () => {
    try {
      const status = await authService.getAuthStatus();
      setIsLoggedIn(status.isLoggedIn);
      setTokenExpiry(tokenManager.getTokens().accessTokenExpiry);
      
      if (status.userData) {
        setUserData(status.userData);
      }
      
      return status.isLoggedIn;
    } catch (error) {
      console.error("Error checking auth status:", error);
      return false;
    }
  }, []);

  // Password reset request
  const forgotPassword = async (identifier) => {
    setAuthError(null);

    try {
      const response = await authService.forgotPassword(identifier);
      return { success: true, message: response.message };
    } catch (error) {
      console.error("Forgot password error:", error);
      setAuthError(error.message);
      return { success: false, message: error.message };
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    setAuthError(null);

    try {
      const response = await authService.resetPassword(token, newPassword);
      return { success: true, message: response.message };
    } catch (error) {
      console.error("Reset password error:", error);
      setAuthError(error.message);
      return { success: false, message: error.message };
    }
  };

  // Context value
  const contextValue = {
    isLoading,
    isLoggedIn,
    userData,
    authError,
    tokenExpiry,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};