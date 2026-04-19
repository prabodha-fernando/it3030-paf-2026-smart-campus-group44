import axios from 'axios'
import { API_BASE } from '../utils/constants'

const axiosInstance = axios.create({
  baseURL: API_BASE || '',
  headers: { 'Content-Type': 'application/json' },
})

// --- Queue System for Concurrent Requests ---
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}
// --------------------------------------------

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {

      // 1. If a refresh is already in progress, pause this request in the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      // 2. Lock the refresh process so other requests wait
      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        localStorage.clear()
        window.location.replace('/login') // Use replace to prevent "Back" button weirdness
        return Promise.reject(error)
      }

      try {
        // 3. Attempt to fetch the new tokens
        const { data } = await axios.post(`${API_BASE}/api/v1/auth/refresh`, { refreshToken })

        localStorage.setItem('accessToken', data.accessToken)
        // Only update refresh token if the backend rotates it
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken)
        }

        // 4. Update the failed request's header and process the queue
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

        processQueue(null, data.accessToken)

        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // 5. If the refresh fails (e.g., refresh token is expired), purge everything
        processQueue(refreshError, null)
        localStorage.clear()
        window.location.replace('/login')
        return Promise.reject(refreshError)
      } finally {
        // 6. Unlock the refresh process
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance