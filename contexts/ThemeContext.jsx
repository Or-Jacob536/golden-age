import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../constants/theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const value = await AsyncStorage.getItem('darkMode');
        if (value !== null) {
          const isDarkMode = value === 'true';
          setDarkMode(isDarkMode);
          setTheme(isDarkMode ? darkTheme : lightTheme);
        } else {
          // Use device theme if no preference is stored
          const isDeviceDark = deviceTheme === 'dark';
          setDarkMode(isDeviceDark);
          setTheme(isDeviceDark ? darkTheme : lightTheme);
        }
      } catch (error) {
        console.error('Error loading theme preference', error);
      }
    };

    loadThemePreference();
  }, [deviceTheme]);

  const toggleTheme = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    setTheme(newDarkMode ? darkTheme : lightTheme);
    
    try {
      await AsyncStorage.setItem('darkMode', newDarkMode.toString());
    } catch (error) {
      console.error('Error saving theme preference', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        darkMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
