import api from './api';
import { parseXmlString } from '../lib/utils/xmlUtils';

/**
 * Get restaurant hours
 * @returns {Promise<Object>} - Restaurant hours data
 */
export const getRestaurantHours = async () => {
  try {
    const response = await api.get('/restaurant/hours');
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurant hours:', error);
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
    const response = await api.get(`/restaurant/menu`, {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching daily menu:', error);
    throw error;
  }
};

/**
 * Get weekly menu starting from a specific date
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @returns {Promise<Object>} - Weekly menu data
 */
export const getWeeklyMenu = async (startDate) => {
  try {
    const response = await api.get(`/restaurant/menu/weekly`, {
      params: { startDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly menu:', error);
    throw error;
  }
};
