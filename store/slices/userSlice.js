import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUserProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch profile' });
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userService.updateUserProfile(userData);
      return response.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update profile' });
    }
  }
);

export const updateUserSettings = createAsyncThunk(
  'user/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await userService.updateUserSettings(settings);
      return response.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update settings' });
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    settings: {
      languagePreference: 'he',
      darkMode: false,
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearUserData: (state) => {
      state.profile = null;
      state.settings = {
        languagePreference: 'he',
        darkMode: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        if (action.payload.languagePreference) {
          state.settings.languagePreference = action.payload.languagePreference;
        }
        if (action.payload.darkMode !== undefined) {
          state.settings.darkMode = action.payload.darkMode;
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch profile';
      })
      
      // updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      })
      
      // updateUserSettings
      .addCase(updateUserSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update settings';
      });
  },
});

export const { clearUserData } = userSlice.actions;
export default userSlice.reducer;
