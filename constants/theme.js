// constants/theme.js
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

// Define font configuration according to React Native Paper v5 structure
const fontConfig = {
  fontFamily: 'Rubik-Regular',
};

// Configure fonts using the proper React Native Paper function
const fonts = configureFonts({
  config: {
    fontFamily: 'Rubik-Regular',
  },
});

/**
 * Light theme configuration for the Golden Age app
 */
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4A90E2',
    secondary: '#5A9CFF',
    background: '#FFFFFF',
    card: '#F5F5F5',
    text: '#333333',
    border: '#E0E0E0',
    notification: '#FF3B30',
    success: '#4CD964',
    warning: '#FF9500',
    error: '#FF3B30',
  },
  typography: {
    fontSize: {
      small: 14,
      medium: 18,
      large: 22,
      xlarge: 28,
    },
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  roundness: 10,
};

/**
 * Dark theme configuration for the Golden Age app
 */
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#5A9CFF',
    secondary: '#4A90E2',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#2C2C2C',
    notification: '#FF453A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
  },
  typography: {
    fontSize: {
      small: 14,
      medium: 18,
      large: 22,
      xlarge: 28,
    },
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  roundness: 10,
};

/**
 * High contrast light theme for accessibility
 */
export const highContrastLightTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#0066CC',
    secondary: '#004499',
    background: '#FFFFFF',
    card: '#F8F8F8',
    text: '#000000',
    border: '#000000',
    notification: '#CC0000',
    success: '#006600',
    warning: '#CC6600',
    error: '#CC0000',
  },
};

/**
 * High contrast dark theme for accessibility
 */
export const highContrastDarkTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    primary: '#66AAFF',
    secondary: '#99CCFF',
    background: '#000000',
    card: '#0A0A0A',
    text: '#FFFFFF',
    border: '#FFFFFF',
    notification: '#FF6666',
    success: '#66FF66',
    warning: '#FFCC66',
    error: '#FF6666',
  },
};

/**
 * Default theme for React Native Paper
 * Using the proper structure expected by PaperProvider
 */
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightTheme.colors.primary,
    secondary: lightTheme.colors.secondary,
  },
  fonts: fonts,
  roundness: 10,
};

/**
 * Get theme based on dark mode and high contrast preferences
 * @param {boolean} darkMode - Whether dark mode is enabled
 * @param {boolean} highContrast - Whether high contrast mode is enabled
 * @returns {Object} The appropriate theme object
 */
export const getTheme = (darkMode, highContrast) => {
  if (darkMode) {
    return highContrast ? highContrastDarkTheme : darkTheme;
  }
  return highContrast ? highContrastLightTheme : lightTheme;
};

export default {
  lightTheme,
  darkTheme,
  highContrastLightTheme,
  highContrastDarkTheme,
  theme,
  getTheme,
};