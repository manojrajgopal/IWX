import axiosClient from './axiosClient';

export const notificationAPI = {
  // Get user notifications
  getNotifications: async (skip = 0, limit = 50) => {
    const response = await axiosClient.get(`/notifications/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  // Get specific notification
  getNotification: async (notificationId) => {
    const response = await axiosClient.get(`/notifications/${notificationId}`);
    return response.data;
  },

  // Create notification
  createNotification: async (notificationData) => {
    const response = await axiosClient.post('/notifications/', notificationData);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await axiosClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await axiosClient.put('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await axiosClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Get notification preferences
  getNotificationPreferences: async () => {
    const response = await axiosClient.get('/notifications/preferences/');
    return response.data;
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferencesData) => {
    const response = await axiosClient.put('/notifications/preferences/', preferencesData);
    return response.data;
  },

  // Get notification statistics
  getNotificationStats: async () => {
    const response = await axiosClient.get('/notifications/stats/');
    return response.data;
  }
};
