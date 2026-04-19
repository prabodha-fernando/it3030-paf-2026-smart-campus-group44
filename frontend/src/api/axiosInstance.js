import axios from 'axios'
import { API_BASE } from '../utils/constants'
import { emitAuthLogout } from '../utils/authEvents'
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from '../utils/authStorage'

const isUnexpectedHtmlApiResponse = (response) => {
  const contentType = response?.headers?.['content-type'] || ''
  const url = response?.config?.url || ''
  return url.startsWith('/api') && contentType.includes('text/html')
}

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
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

axiosInstance.interceptors.response.use(
  (response) => {
    if (isUnexpectedHtmlApiResponse(response)) {
      clearAuthTokens()
      emitAuthLogout()
      return Promise.reject(new Error('Unauthorized HTML response for API request'))
    }
    return response
  },
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

      const refreshToken = getRefreshToken()

      if (!refreshToken) {
        clearAuthTokens()
        emitAuthLogout()
        return Promise.reject(error)
      }

      try {
        // 3. Attempt to fetch the new tokens
        const { data } = await axios.post(`${API_BASE}/api/v1/auth/refresh`, { refreshToken })

        setAuthTokens(data.accessToken, data.refreshToken)

        // 4. Update the failed request's header and process the queue
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

        processQueue(null, data.accessToken)

        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // 5. If the refresh fails, purge everything
        processQueue(refreshError, null)
        clearAuthTokens()
        emitAuthLogout()
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