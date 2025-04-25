// services/medicalService.js
import api, { API_ENDPOINTS } from './api';

const medicalService = {
getMedicalAppointments: async () => {
  const response = await api.get(API_ENDPOINTS.MEDICAL_APPOINTMENTS);
  return response.data;
},

getMedicalAppointment: async (appointmentId) => {
  const response = await api.get(API_ENDPOINTS.MEDICAL_APPOINTMENT_DETAILS(appointmentId));
  return response.data;
},

getMedicalRecords: async () => {
  const response = await api.get(API_ENDPOINTS.MEDICAL_RECORDS);
  return response.data;
},
};

export default medicalService;
