// store/slices/activitiesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import activitiesService from '../../services/activitiesService';

export const fetchActivities = createAsyncThunk(
'activities/fetchActivities',
async (date, { rejectWithValue }) => {
  try {
    const response = await activitiesService.getActivities(date);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch activities' });
  }
}
);

export const fetchWeeklyActivities = createAsyncThunk(
'activities/fetchWeeklyActivities',
async (startDate, { rejectWithValue }) => {
  try {
    const response = await activitiesService.getWeeklyActivities(startDate);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch weekly activities' });
  }
}
);

export const fetchActivityDetails = createAsyncThunk(
'activities/fetchActivityDetails',
async (activityId, { rejectWithValue }) => {
  try {
    const response = await activitiesService.getActivityDetails(activityId);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch activity details' });
  }
}
);

export const registerForActivity = createAsyncThunk(
'activities/registerForActivity',
async (activityId, { rejectWithValue }) => {
  try {
    const response = await activitiesService.registerForActivity(activityId);
    return { activityId, response };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to register for activity' });
  }
}
);

export const cancelActivityRegistration = createAsyncThunk(
'activities/cancelRegistration',
async (activityId, { rejectWithValue }) => {
  try {
    const response = await activitiesService.cancelActivityRegistration(activityId);
    return { activityId, response };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to cancel registration' });
  }
}
);

export const fetchMyActivities = createAsyncThunk(
'activities/fetchMyActivities',
async (_, { rejectWithValue }) => {
  try {
    const response = await activitiesService.getMyActivities();
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch my activities' });
  }
}
);

const activitiesSlice = createSlice({
name: 'activities',
initialState: {
  dailyActivities: null,
  weeklyActivities: null,
  activityDetails: null,
  myActivities: [],
  loading: false,
  error: null,
},
reducers: {},
extraReducers: (builder) => {
  builder
    // fetchActivities
    .addCase(fetchActivities.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchActivities.fulfilled, (state, action) => {
      state.loading = false;
      state.dailyActivities = action.payload;
    })
    .addCase(fetchActivities.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch activities';
    })
    
    // fetchWeeklyActivities
    .addCase(fetchWeeklyActivities.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchWeeklyActivities.fulfilled, (state, action) => {
      state.loading = false;
      state.weeklyActivities = action.payload;
    })
    .addCase(fetchWeeklyActivities.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch weekly activities';
    })
    
    // fetchActivityDetails
    .addCase(fetchActivityDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchActivityDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.activityDetails = action.payload;
    })
    .addCase(fetchActivityDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch activity details';
    })
    
    // registerForActivity
    .addCase(registerForActivity.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(registerForActivity.fulfilled, (state, action) => {
      state.loading = false;
      
      // Update activityDetails if it matches the registered activity
      if (state.activityDetails && state.activityDetails.id === action.payload.activityId) {
        state.activityDetails = {
          ...state.activityDetails,
          isRegistered: true,
          currentParticipants: state.activityDetails.currentParticipants + 1
        };
      }
      
      // Update in dailyActivities if exists
      if (state.dailyActivities && state.dailyActivities.activities) {
        state.dailyActivities.activities = state.dailyActivities.activities.map(
          activity => activity.id === action.payload.activityId
            ? { ...activity, isRegistered: true, currentParticipants: activity.currentParticipants + 1 }
            : activity
        );
      }
    })
    .addCase(registerForActivity.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to register for activity';
    })
    
    // cancelActivityRegistration
    .addCase(cancelActivityRegistration.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(cancelActivityRegistration.fulfilled, (state, action) => {
      state.loading = false;
      
      // Update activityDetails if it matches the canceled activity
      if (state.activityDetails && state.activityDetails.id === action.payload.activityId) {
        state.activityDetails = {
          ...state.activityDetails,
          isRegistered: false,
          currentParticipants: state.activityDetails.currentParticipants - 1
        };
      }
      
      // Update in dailyActivities if exists
      if (state.dailyActivities && state.dailyActivities.activities) {
        state.dailyActivities.activities = state.dailyActivities.activities.map(
          activity => activity.id === action.payload.activityId
            ? { ...activity, isRegistered: false, currentParticipants: activity.currentParticipants - 1 }
            : activity
        );
      }
      
      // Remove from myActivities
      state.myActivities = state.myActivities.filter(
        activity => activity.id !== action.payload.activityId
      );
    })
    .addCase(cancelActivityRegistration.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to cancel registration';
    })
    
    // fetchMyActivities
    .addCase(fetchMyActivities.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMyActivities.fulfilled, (state, action) => {
      state.loading = false;
      state.myActivities = action.payload;
    })
    .addCase(fetchMyActivities.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch my activities';
    });
},
})

const selectActivitiesState = state => state.activities;

// Memoized selectors
export const selectDailyActivities = createSelector(
  [selectActivitiesState],
  activities => activities.dailyActivities
);

export const selectWeeklyActivities = createSelector(
  [selectActivitiesState],
  activities => activities.weeklyActivities
);

export const selectActivityDetails = createSelector(
  [selectActivitiesState],
  activities => activities.activityDetails
);

export const selectMyActivities = createSelector(
  [selectActivitiesState],
  activities => activities.myActivities
);

export const selectActivitiesLoading = createSelector(
  [selectActivitiesState],
  activities => activities.loading
);

export const selectActivitiesError = createSelector(
  [selectActivitiesState],
  activities => activities.error
);;

export default activitiesSlice.reducer;
