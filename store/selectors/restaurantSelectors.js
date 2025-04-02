// store/selectors/restaurantSelectors.js
import { createSelector } from '@reduxjs/toolkit';

// Base selectors (these directly access state properties)
const getRestaurantState = state => state.restaurant;

// Instead of simple getters, add minimal transformations
export const selectRestaurantLoading = state => Boolean(state.restaurant.loading);
export const selectRestaurantError = state => state.restaurant.error || null;

// For daily menu, apply minimal transformation
export const selectDailyMenu = createSelector(
  [state => state.restaurant.dailyMenu],
  (dailyMenu) => dailyMenu ? { ...dailyMenu } : null
);

// Meal-specific selectors with transformations
export const selectBreakfastMenu = createSelector(
  [selectDailyMenu],
  (dailyMenu) => {
    if (!dailyMenu || !dailyMenu.meals || !dailyMenu.meals.breakfast) {
      return null;
    }
    // Return a new object to ensure reference changes
    return { ...dailyMenu.meals.breakfast };
  }
);

export const selectLunchMenu = createSelector(
  [selectDailyMenu],
  (dailyMenu) => {
    if (!dailyMenu || !dailyMenu.meals || !dailyMenu.meals.lunch) {
      return null;
    }
    return { ...dailyMenu.meals.lunch };
  }
);

export const selectDinnerMenu = createSelector(
  [selectDailyMenu],
  (dailyMenu) => {
    if (!dailyMenu || !dailyMenu.meals || !dailyMenu.meals.dinner) {
      return null;
    }
    return { ...dailyMenu.meals.dinner };
  }
);

// Hours selector with transformation
export const selectRestaurantHours = createSelector(
  [state => state.restaurant.hours],
  (hours) => hours ? { ...hours } : null
);

// Formatter for hours
export const selectFormattedRestaurantHours = createSelector(
  [selectRestaurantHours],
  (hours) => {
    if (!hours) return null;
    
    return {
      weekdays: hours.weekdays ? { ...hours.weekdays } : {},
      weekend: hours.weekend ? { ...hours.weekend } : {}
    };
  }
);

// Weekly menu selector
export const selectWeeklyMenu = createSelector(
  [state => state.restaurant.weeklyMenu],
  (weeklyMenu) => weeklyMenu ? { ...weeklyMenu } : null
);

// Weekly menu by day
export const selectWeeklyMenuByDay = createSelector(
  [selectWeeklyMenu],
  (weeklyMenu) => {
    if (!weeklyMenu || !weeklyMenu.menus) {
      return {};
    }
    
    // Transform array to map by date
    const menusByDay = {};
    weeklyMenu.menus.forEach(menu => {
      if (menu.date) {
        menusByDay[menu.date] = { ...menu };
      }
    });
    
    return menusByDay;
  }
);