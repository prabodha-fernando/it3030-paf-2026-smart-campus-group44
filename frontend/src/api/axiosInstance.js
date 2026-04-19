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
  // Fallback to empty string if API_BASE bypasses the Vite proxy
  baseURL: API_BASE || '', 
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

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
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearAuthTokens()
        emitAuthLogout()
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(`${API_BASE}/api/v1/auth/refresh`, { refreshToken })
        setAuthTokens(data.accessToken, data.refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return axiosInstance(original)
      } catch {
        clearAuthTokens()
        emitAuthLogout()
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance