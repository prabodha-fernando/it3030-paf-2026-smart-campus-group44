import axiosInstance from './axiosInstance'

export const createTicket = (data) => axiosInstance.post('/api/tickets', data)
export const getTickets = () => axiosInstance.get('/api/tickets')
export const getTicketById = (id) => axiosInstance.get(`/api/tickets/${id}`)
export const updateTicketStatus = (id, payload) => axiosInstance.put(`/api/tickets/${id}/status`, payload)

export const getTicketComments = (id) => axiosInstance.get(`/api/tickets/${id}/comments`)
export const addTicketComment = (id, content) => axiosInstance.post(`/api/tickets/${id}/comments`, { content })

export const getTicketAttachments = (id) => axiosInstance.get(`/api/tickets/${id}/attachments`)
export const uploadTicketAttachment = (id, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return axiosInstance.post(`/api/tickets/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const assignTechnician = (ticketId, userId) =>
  axiosInstance.put(`/api/tickets/${ticketId}/assign/${userId}`)
