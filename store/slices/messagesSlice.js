// store/slices/messagesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import messagesService from '../../services/messagesService';

export const fetchMessages = createAsyncThunk(
'messages/fetchMessages',
async (_, { rejectWithValue }) => {
  try {
    const response = await messagesService.getMessages();
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch messages' });
  }
}
);

export const fetchMessageDetails = createAsyncThunk(
'messages/fetchMessageDetails',
async (messageId, { rejectWithValue }) => {
  try {
    const response = await messagesService.getMessage(messageId);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to fetch message details' });
  }
}
);

export const markMessageAsRead = createAsyncThunk(
'messages/markAsRead',
async (messageId, { rejectWithValue }) => {
  try {
    const response = await messagesService.markMessageAsRead(messageId);
    return { messageId, response };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to mark message as read' });
  }
}
);

export const sendMessage = createAsyncThunk(
'messages/sendMessage',
async (messageData, { rejectWithValue }) => {
  try {
    const response = await messagesService.sendMessage(messageData);
    return response;
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to send message' });
  }
}
);

export const deleteMessage = createAsyncThunk(
'messages/deleteMessage',
async (messageId, { rejectWithValue }) => {
  try {
    const response = await messagesService.deleteMessage(messageId);
    return { messageId, response };
  } catch (error) {
    return rejectWithValue(error.response?.data || { message: 'Failed to delete message' });
  }
}
);

const messagesSlice = createSlice({
name: 'messages',
initialState: {
  messages: [],
  messageDetails: null,
  unreadCount: 0,
  loading: false,
  error: null,
},
reducers: {},
extraReducers: (builder) => {
  builder
    // fetchMessages
    .addCase(fetchMessages.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMessages.fulfilled, (state, action) => {
      state.loading = false;
      state.messages = action.payload.messages || [];
      state.unreadCount = state.messages.filter(msg => !msg.read).length;
    })
    .addCase(fetchMessages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch messages';
    })
    
    // fetchMessageDetails
    .addCase(fetchMessageDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchMessageDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.messageDetails = action.payload;
      
      // If message was marked as read in the backend, update it in the messages array
      if (action.payload.read && state.messages.length > 0) {
        const messageIndex = state.messages.findIndex(msg => msg.id === action.payload.id);
        if (messageIndex >= 0 && !state.messages[messageIndex].read) {
          state.messages[messageIndex].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    })
    .addCase(fetchMessageDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch message details';
    })
    
    // markMessageAsRead
    .addCase(markMessageAsRead.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(markMessageAsRead.fulfilled, (state, action) => {
      state.loading = false;
      
      // Update the message in the messages array
      const messageIndex = state.messages.findIndex(msg => msg.id === action.payload.messageId);
      if (messageIndex >= 0 && !state.messages[messageIndex].read) {
        state.messages[messageIndex].read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      
      // Update messageDetails if it's the current message
      if (state.messageDetails && state.messageDetails.id === action.payload.messageId) {
        state.messageDetails.read = true;
        state.messageDetails.readAt = new Date().toISOString();
      }
    })
    .addCase(markMessageAsRead.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to mark message as read';
    })
    
    // sendMessage
    .addCase(sendMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(sendMessage.fulfilled, (state, action) => {
      state.loading = false;
      // We don't have the sent message in the response to add to the list
    })
    .addCase(sendMessage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to send message';
    })
    
    // deleteMessage
    .addCase(deleteMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteMessage.fulfilled, (state, action) => {
      state.loading = false;
      
      // Remove the message from the messages array
      const deletedMessage = state.messages.find(msg => msg.id === action.payload.messageId);
      state.messages = state.messages.filter(msg => msg.id !== action.payload.messageId);
      
      // Update unread count if necessary
      if (deletedMessage && !deletedMessage.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      
      // Clear messageDetails if it's the deleted message
      if (state.messageDetails && state.messageDetails.id === action.payload.messageId) {
        state.messageDetails = null;
      }
    })
    .addCase(deleteMessage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to delete message';
    });
},
});

export default messagesSlice.reducer;
