import axiosInstance from './axiosInstance';

/**
 * Fetch all resources
 */
export const getAllResources = async () => {
  const response = await axiosInstance.get('/api/resources');
  return response.data;
};

/**
 * Fetch a specific resource by ID
 */
export const getResourceById = async (id) => {
  const response = await axiosInstance.get(`/api/resources/${id}`);
  return response.data;
};

/**
 * Search resources with optional filters
 * @param {Object} params - { type, location, minCapacity, status }
 */
export const searchResources = async (params) => {
  const response = await axiosInstance.get('/api/resources/search', { params });
  return response.data;
};

/**
 * Create a new resource (ADMIN only)
 * @param {Object} data - ResourceRequest DTO
 */
export const createResource = async (data) => {
  const response = await axiosInstance.post('/api/resources', data);
  return response.data;
};

/**
 * Update an existing resource (ADMIN only)
 * @param {Number} id - Resource ID
 * @param {Object} data - ResourceRequest DTO
 */
export const updateResource = async (id, data) => {
  const response = await axiosInstance.put(`/api/resources/${id}`, data);
  return response.data;
};

/**
 * Delete a resource (ADMIN only)
 * @param {Number} id - Resource ID
 */
export const deleteResource = async (id) => {
  await axiosInstance.delete(`/api/resources/${id}`);
};
