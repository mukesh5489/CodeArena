/**
 * notificationService.js – In-App Notifications API Client
 */

import api from './api';

export const getNotifications = async () => {
  const res = await api.get('/notifications');
  return res.data;
};

export const markNotificationAsRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsAsRead = async () => {
  const res = await api.patch('/notifications/read-all');
  return res.data;
};
