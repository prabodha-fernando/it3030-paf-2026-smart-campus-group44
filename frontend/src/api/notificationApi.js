import axiosInstance from './axiosInstance'

export const getNotifications   = (params) => axiosInstance.get('/api/v1/notifications', { params })
export const getUnreadCount     = ()        => axiosInstance.get('/api/v1/notifications/unread-count')
export const markAsRead         = (id)      => axiosInstance.patch(`/api/v1/notifications/${id}/read`)
export const markAllAsRead      = ()        => axiosInstance.patch('/api/v1/notifications/read-all')
export const deleteNotification = (id)      => axiosInstance.delete(`/api/v1/notifications/${id}`)
export const getPreferences     = ()        => axiosInstance.get('/api/v1/notifications/preferences')
export const updatePreferences  = (data)    => axiosInstance.put('/api/v1/notifications/preferences', data)