// store/selectors/activitiesSelectors.js
import { createSelector } from '@reduxjs/toolkit';

// Simple selectors with minimal transformation
export const selectActivitiesLoading = state => Boolean(state.activities.loading);
export const selectActivitiesError = state => state.activities.error || null;

// Activities selectors with transformations
export const selectDailyActivities = createSelector(
  [state => state.activities.dailyActivities],
  (dailyActivities) => dailyActivities ? { ...dailyActivities } : null
);

// Activity list extract and transform
export const selectActivityList = createSelector(
  [state => state.activities.dailyActivities],
  (dailyActivities) => {
    if (!dailyActivities || !dailyActivities.activities) {
      return [];
    }
    // Create a new array with a shallow copy of each activity
    return dailyActivities.activities.map(activity => ({ ...activity }));
  }
);

export const selectWeeklyActivities = createSelector(
  [state => state.activities.weeklyActivities],
  (weeklyActivities) => weeklyActivities ? { ...weeklyActivities } : null
);

export const selectActivityDetails = createSelector(
  [state => state.activities.activityDetails],
  (activityDetails) => activityDetails ? { ...activityDetails } : null
);

export const selectMyActivities = createSelector(
  [state => state.activities.myActivities],
  (myActivities) => myActivities ? [...myActivities] : []
);

// Complex selectors
export const selectUpcomingActivities = createSelector(
  [selectMyActivities],
  (myActivities) => {
    if (!myActivities.length) return [];
    
    const now = new Date();
    return myActivities
      .filter(activity => {
        const activityDate = new Date(`${activity.date}T${activity.startTime}`);
        return activityDate > now;
      })
      .map(activity => ({ ...activity })); // Return new object for each item
  }
);

export const selectActivitiesByLocation = createSelector(
  [selectActivityList],
  (activities) => {
    if (!activities.length) return {};
    
    // Group activities by location
    const byLocation = {};
    activities.forEach(activity => {
      const location = activity.location || 'Unknown';
      if (!byLocation[location]) {
        byLocation[location] = [];
      }
      byLocation[location].push({ ...activity });
    });
    
    return byLocation;
  }
);

export const selectActivitiesByInstructor = createSelector(
  [selectActivityList],
  (activities) => {
    if (!activities.length) return {};
    
    // Group activities by instructor
    const byInstructor = {};
    activities.forEach(activity => {
      const instructor = activity.instructor || 'Unknown';
      if (!byInstructor[instructor]) {
        byInstructor[instructor] = [];
      }
      byInstructor[instructor].push({ ...activity });
    });
    
    return byInstructor;
  }
);

export const selectWeeklyActivitiesByDay = createSelector(
  [selectWeeklyActivities],
  (weeklyActivities) => {
    if (!weeklyActivities || !weeklyActivities.activities) {
      return {};
    }
    
    // Transform to map by day
    const activitiesByDay = {};
    weeklyActivities.activities.forEach(activity => {
      if (!activitiesByDay[activity.date]) {
        activitiesByDay[activity.date] = [];
      }
      activitiesByDay[activity.date].push({ ...activity });
    });
    
    return activitiesByDay;
  }
);