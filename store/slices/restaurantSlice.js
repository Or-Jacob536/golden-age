import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDailyMenu, getRestaurantHours, getWeeklyMenu } from "../../services/restaurantService";  // Adjust the path as needed
import { createSelector } from 'reselect';

export const fetchRestaurantHours = createAsyncThunk(
  "restaurant/fetchHours",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRestaurantHours();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch restaurant hours" }
      );
    }
  }
);

export const fetchDailyMenu = createAsyncThunk(
  "restaurant/fetchDailyMenu",
  async (date, { rejectWithValue }) => {
    try {
      const response = await getDailyMenu(date);  // Use the named import directly
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch daily menu" }
      );
    }
  }
);

export const fetchWeeklyMenu = createAsyncThunk(
  "restaurant/fetchWeeklyMenu",
  async (startDate, { rejectWithValue }) => {
    try {
      const response = await getWeeklyMenu(startDate);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch weekly menu" }
      );
    }
  }
);

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState: {
    hours: null,
    dailyMenu: null,
    weeklyMenu: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchRestaurantHours
      .addCase(fetchRestaurantHours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantHours.fulfilled, (state, action) => {
        state.loading = false;
        state.hours = action.payload;
      })
      .addCase(fetchRestaurantHours.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch restaurant hours";
      })

      // fetchDailyMenu
      .addCase(fetchDailyMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyMenu = action.payload;
      })
      .addCase(fetchDailyMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch daily menu";
      })

      // fetchWeeklyMenu
      .addCase(fetchWeeklyMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.weeklyMenu = action.payload;
      })
      .addCase(fetchWeeklyMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch weekly menu";
      });
  },
});

// Add these at the bottom of your file
const selectRestaurantState = state => state.restaurant;

export const selectDailyMenu = createSelector(
  [selectRestaurantState],
  restaurant => restaurant.dailyMenu
);

export const selectRestaurantHours = createSelector(
  [selectRestaurantState],
  restaurant => restaurant.hours
);

export default restaurantSlice.reducer;
