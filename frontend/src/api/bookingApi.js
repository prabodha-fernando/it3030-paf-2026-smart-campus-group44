import axiosInstance from './axiosInstance'

export const getBookings = (params) =>
  axiosInstance.get('/api/v1/bookings', { params })

export const createBooking = (data) =>
  axiosInstance.post('/api/v1/bookings', data)

export const approveBooking = (id, data) =>
  axiosInstance.patch(`/api/v1/bookings/${id}/approve`, data)

export const rejectBooking = (id, data) =>
  axiosInstance.patch(`/api/v1/bookings/${id}/reject`, data)

export const cancelBooking = (id) =>
  axiosInstance.patch(`/api/v1/bookings/${id}/cancel`)

export const deleteBooking = (id) =>
  axiosInstance.delete(`/api/v1/bookings/${id}`)

export const getBooking = (id) =>
  axiosInstance.get(`/api/v1/bookings/${id}`)

export const getCalendarEvents = (params) =>
  axiosInstance.get('/api/v1/bookings/calendar', { params })
