import api, { API_ENDPOINTS } from './api';

/**
 * Get restaurant hours
 * @returns {Promise<Object>} - Restaurant hours data
 */

export const getRestaurantHours = async () => {
  console.log('Service: Requesting restaurant hours');
  try {
    const response = await api.get(API_ENDPOINTS.RESTAURANT_HOURS);
    console.log('Service: Restaurant hours received');
    return response.data;
  } catch (error) {
    console.error('Service: Error fetching restaurant hours:', error);
    throw error;
  }
};

/**
 * Get daily menu for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} - Daily menu data
 */

export const getDailyMenu = async (date) => {
  try {
    const response = await api.get(API_ENDPOINTS.DAILY_MENU, {
      params: { date }
    });
    console.log('Service: Daily menu response received');
    return response.data;
  } catch (error) {
    console.error('Service: Error fetching daily menu:', error);
    throw error;
  }
};

/**
 * Get weekly menu starting from a specific date
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @returns {Promise<Object>} - Weekly menu data
 */

export const getWeeklyMenu = async (startDate) => {
  console.log(`Service: Requesting weekly menu starting from: ${startDate || 'this week'}`);
  try {
    const response = await api.get(API_ENDPOINTS.WEEKLY_MENU, {
      params: { startDate }
    });
    console.log('Service: Weekly menu response received');
    return response.data;
  } catch (error) {
    console.error('Service: Error fetching weekly menu:', error);
    throw error;
  }
};

// Add default export for easier importing in other files
export default { getRestaurantHours, getDailyMenu, getWeeklyMenu };