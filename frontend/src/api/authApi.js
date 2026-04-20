import axiosInstance from './axiosInstance'

export const getMe        = ()       => axiosInstance.get('/api/v1/auth/me')
export const refreshToken = (token)  => axiosInstance.post('/api/v1/auth/refresh', { refreshToken: token })
export const logout       = (token)  => axiosInstance.post('/api/v1/auth/logout',  { refreshToken: token })

export const getMyProfile    = ()        => axiosInstance.get('/api/v1/users/me')
export const updateMyProfile = (data)    => axiosInstance.put('/api/v1/users/me', data)
export const getAllUsers      = (params) => axiosInstance.get('/api/v1/users', { params })
export const changeUserRole   = (id, role) => axiosInstance.patch(`/api/v1/users/${id}/role`, { role })
export const changeMyRole     = (role) => axiosInstance.patch('/api/v1/users/me/role', { role })

export const submitRoleRequest  = (data)       => axiosInstance.post('/api/v1/role-requests', data)
export const getRoleRequests    = (params)     => axiosInstance.get('/api/v1/role-requests', { params })
export const processRoleRequest = (id, data)   => axiosInstance.patch(`/api/v1/role-requests/${id}`, data)
export const cancelRoleRequest  = (id)         => axiosInstance.delete(`/api/v1/role-requests/${id}`)