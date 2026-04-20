import axiosInstance from './axiosInstance';

const BASE_URL = '/api/resources';

/**
 * Fetch all resources
 * @param {Object} [config={}] - Optional Axios request configuration (e.g., AbortSignal)
 * @returns {Promise<Array>} List of resources
 */
export const getAllResources = async (config = {}) => {
  const response = await axiosInstance.get(BASE_URL, config);
  return response.data;
};

/**
 * Fetch a specific resource by ID
 * @param {Number|String} id - The unique identifier of the resource
 * @param {Object} [config={}] - Optional Axios request configuration
 * @returns {Promise<Object>} The requested resource details
 */
export const getResourceById = async (id, config = {}) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}`, config);
  return response.data;
};

/**
 * Search resources with optional filters and pagination
 * @param {Object} params - { type, location, minCapacity, status, page, size, sort }
 * @param {Object} [config={}] - Optional Axios request configuration
 * @returns {Promise<Array|Object>} Filtered list of resources (or Paged object)
 */
export const searchResources = async (params, config = {}) => {
  // Axios automatically serializes the params object into a query string
  // We merge the params with any additional config (like headers or cancel tokens)
  const response = await axiosInstance.get(`${BASE_URL}/search`, {
    params,
    ...config
  });
  return response.data;
};

/**
 * Create a new resource (ADMIN only)
 * @param {Object} data - ResourceRequest DTO containing name, type, capacity, etc.
 * @param {Object} [config={}] - Optional Axios request configuration
 * @returns {Promise<Object>} The newly created resource
 */
export const createResource = async (data, config = {}) => {
  const response = await axiosInstance.post(BASE_URL, data, config);
  return response.data;
};

/**
 * Update an existing resource (ADMIN only)
 * @param {Number|String} id - Resource ID to update
 * @param {Object} data - ResourceRequest DTO with updated values
 * @param {Object} [config={}] - Optional Axios request configuration
 * @returns {Promise<Object>} The updated resource
 */
export const updateResource = async (id, data, config = {}) => {
  const response = await axiosInstance.put(`${BASE_URL}/${id}`, data, config);
  return response.data;
};

/**
 * Delete a resource (ADMIN only)
 * @param {Number|String} id - Resource ID to delete
 * @param {Object} [config={}] - Optional Axios request configuration
 * @returns {Promise<void>}
 */
export const deleteResource = async (id, config = {}) => {
  await axiosInstance.delete(`${BASE_URL}/${id}`, config);
};