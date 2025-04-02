// store/selectors/messagesSelectors.js
import { createSelector } from '@reduxjs/toolkit';

// Simple selectors with transformations
export const selectMessagesLoading = state => Boolean(state.messages.loading);
export const selectMessagesError = state => state.messages.error || null;

// Messages selectors with transformations
export const selectAllMessages = createSelector(
  [state => state.messages.messages],
  (messages) => messages ? [...messages] : []
);

export const selectMessageDetails = createSelector(
  [state => state.messages.messageDetails],
  (details) => details ? { ...details } : null
);

export const selectUnreadCount = createSelector(
  [state => state.messages.unreadCount],
  (count) => count || 0 // Default to 0 if undefined
);

// Complex selectors
export const selectUnreadMessages = createSelector(
  [selectAllMessages],
  (messages) => {
    return messages.filter(message => !message.read).map(msg => ({ ...msg }));
  }
);

export const selectReadMessages = createSelector(
  [selectAllMessages],
  (messages) => {
    return messages.filter(message => message.read).map(msg => ({ ...msg }));
  }
);

export const selectMessagesBySender = createSelector(
  [selectAllMessages],
  (messages) => {
    const bySender = {};
    messages.forEach(message => {
      const senderId = message.senderId;
      if (!bySender[senderId]) {
        bySender[senderId] = [];
      }
      bySender[senderId].push({ ...message });
    });
    return bySender;
  }
);

export const selectMessagesGroupedByDate = createSelector(
  [selectAllMessages],
  (messages) => {
    const byDate = {};
    
    messages.forEach(message => {
      // Get just the date part
      const date = new Date(message.createdAt).toISOString().split('T')[0];
      
      if (!byDate[date]) {
        byDate[date] = [];
      }
      byDate[date].push({ ...message });
    });
    
    return byDate;
  }
);

// Sorted messages by date
export const selectMessagesSortedByDate = createSelector(
  [selectAllMessages],
  (messages) => {
    if (!messages.length) return [];
    
    return [...messages]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(msg => ({ ...msg })); // Create new objects
  }
);

// Get recent messages (last 7 days)
export const selectRecentMessages = createSelector(
  [selectAllMessages],
  (messages) => {
    if (!messages.length) return [];
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return messages
      .filter(message => {
        const messageDate = new Date(message.createdAt);
        return messageDate >= oneWeekAgo;
      })
      .map(msg => ({ ...msg })); // Create new objects
  }
);