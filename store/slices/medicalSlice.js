import { createSelector } from 'reselect';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import medicalService from '../../services/medicalService';

export const fetchMedicalAppointments = createAsyncThunk(
'medical/fetchAppointments',
async (_, { rejectWithValue }) => {
  try {
    const response = await medicalService.getMedicalAppointments();
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch medical appointments' });
  }
}
);

export const fetchMedicalAppointment = createAsyncThunk(
'medical/fetchAppointment',
async (appointmentId, { rejectWithValue }) => {
  try {
    const response = await medicalService.getMedicalAppointment(appointmentId);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch medical appointment' });
  }
}
);

export const fetchMedicalRecords = createAsyncThunk(
'medical/fetchRecords',
async (_, { rejectWithValue }) => {
  try {
    const response = await medicalService.getMedicalRecords();
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch medical records' });
  }
}
);

const medicalSlice = createSlice({
name: 'medical',
initialState: {
  appointments: {
    upcoming: [],
    past: [],
  },
  appointmentDetails: null,
  medicalRecords: null,
  loading: false,
  error: null,
},
reducers: {},
extraReducers: (builder) => {
  builder
    // fetchMedicalAppointments
    .addCase(fetchMedicalAppointments.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMedicalAppointments.fulfilled, (state, action) => {
      state.loading = false;
      state.appointments = {
        upcoming: action.payload.upcoming || [],
        past: action.payload.past || [],
      };
    })
    .addCase(fetchMedicalAppointments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch medical appointments';
    })
    
    // fetchMedicalAppointment
    .addCase(fetchMedicalAppointment.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMedicalAppointment.fulfilled, (state, action) => {
      state.loading = false;
      state.appointmentDetails = action.payload;
    })
    .addCase(fetchMedicalAppointment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch medical appointment';
    })
    
    // fetchMedicalRecords
    .addCase(fetchMedicalRecords.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMedicalRecords.fulfilled, (state, action) => {
      state.loading = false;
      state.medicalRecords = action.payload;
    })
    .addCase(fetchMedicalRecords.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch medical records';
    });
},
});

const selectMedicalState = state => state.medical;

export const selectUpcomingAppointments = createSelector(
  [selectMedicalState],
  medical => medical.appointments?.upcoming || []
);

export const selectPastAppointments = createSelector(
  [selectMedicalState],
  medical => medical.appointments?.past || []
);

export default medicalSlice.reducer;
