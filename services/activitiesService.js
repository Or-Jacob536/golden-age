// services/activitiesService.js
import api, { API_ENDPOINTS } from './api';

const activitiesService = {
getActivities: async (date) => {
  const response = await api.get(API_ENDPOINTS.ACTIVITIES, {
    params: date ? { date } : {}
  });
  return response.data;
},

getWeeklyActivities: async (startDate) => {
  const response = await api.get(API_ENDPOINTS.WEEKLY_ACTIVITIES, {
    params: startDate ? { startDate } : {}
  });
  return response.data;
},

getActivityDetails: async (activityId) => {
  const response = await api.get(API_ENDPOINTS.ACTIVITY_DETAILS(activityId));
  return response.data;
},

registerForActivity: async (activityId) => {
  const response = await api.post(API_ENDPOINTS.REGISTER_ACTIVITY(activityId));
  return response.data;
},

cancelActivityRegistration: async (activityId) => {
  const response = await api.delete(API_ENDPOINTS.REGISTER_ACTIVITY(activityId));
  return response.data;
},

getMyActivities: async () => {
  const response = await api.get(API_ENDPOINTS.MY_ACTIVITIES);
  return response.data;
},
};

export default activitiesService;
