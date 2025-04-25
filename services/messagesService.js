// services/messagesService.js
import api, { API_ENDPOINTS } from './api';

const messagesService = {
getMessages: async () => {
  const response = await api.get(API_ENDPOINTS.MESSAGES);
  return response.data;
},

getMessage: async (messageId) => {
  const response = await api.get(API_ENDPOINTS.MESSAGE_DETAILS(messageId));
  return response.data;
},

markMessageAsRead: async (messageId) => {
  const response = await api.put(API_ENDPOINTS.MARK_MESSAGE_READ(messageId));
  return response.data;
},

sendMessage: async (messageData) => {
  const response = await api.post(API_ENDPOINTS.MESSAGES, messageData);
  return response.data;
},

deleteMessage: async (messageId) => {
  const response = await api.delete(API_ENDPOINTS.MESSAGE_DETAILS(messageId));
  return response.data;
},
};

export default messagesService;
