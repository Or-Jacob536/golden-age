// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import restaurantReducer from './slices/restaurantSlice';
import activitiesReducer from './slices/activitiesSlice';
import messagesReducer from './slices/messagesSlice';
import medicalReducer from './slices/medicalSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    restaurant: restaurantReducer,
    activities: activitiesReducer,
    messages: messagesReducer,
    medical: medicalReducer,
  },
});

export default store;