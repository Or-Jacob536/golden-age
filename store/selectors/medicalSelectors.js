// store/selectors/medicalSelectors.js
import { createSelector } from '@reduxjs/toolkit';

// Simple selectors with minimal transformations
export const selectMedicalLoading = state => Boolean(state.medical.loading);
export const selectMedicalError = state => state.medical.error || null;

// Appointment selectors with transformations
export const selectUpcomingAppointments = createSelector(
  [state => state.medical.appointments.upcoming],
  (upcoming) => upcoming ? [...upcoming] : []
);

export const selectPastAppointments = createSelector(
  [state => state.medical.appointments.past],
  (past) => past ? [...past] : []
);

export const selectAllAppointments = createSelector(
  [selectUpcomingAppointments, selectPastAppointments],
  (upcoming, past) => {
    // Return a new array combining both
    return [...upcoming, ...past];
  }
);

export const selectAppointmentDetails = createSelector(
  [state => state.medical.appointmentDetails],
  (details) => details ? { ...details } : null
);

export const selectMedicalRecords = createSelector(
  [state => state.medical.medicalRecords],
  (records) => records ? [...records] : []
);

// Complex selectors
export const selectAppointmentsByDoctor = createSelector(
  [selectAllAppointments],
  (appointments) => {
    if (!appointments.length) return {};
    
    // Group appointments by doctor
    const byDoctor = {};
    appointments.forEach(appointment => {
      if (!byDoctor[appointment.doctorName]) {
        byDoctor[appointment.doctorName] = [];
      }
      byDoctor[appointment.doctorName].push({ ...appointment });
    });
    
    return byDoctor;
  }
);

export const selectAppointmentsCalendar = createSelector(
  [selectAllAppointments],
  (appointments) => {
    if (!appointments.length) return {};
    
    // Transform into calendar format
    const calendarEvents = {};
    appointments.forEach(appointment => {
      const dateKey = appointment.date;
      if (!calendarEvents[dateKey]) {
        calendarEvents[dateKey] = [];
      }
      
      calendarEvents[dateKey].push({
        id: appointment.id,
        title: appointment.doctorName,
        time: appointment.time,
        location: appointment.location,
        isCompleted: appointment.completed,
      });
    });
    
    return calendarEvents;
  }
);

export const selectMedicalRecordsByType = createSelector(
  [selectMedicalRecords],
  (records) => {
    if (!records.length) return {};
    
    // Group records by type
    const byType = {};
    records.forEach(record => {
      if (!byType[record.recordType]) {
        byType[record.recordType] = [];
      }
      byType[record.recordType].push({ ...record });
    });
    
    return byType;
  }
);