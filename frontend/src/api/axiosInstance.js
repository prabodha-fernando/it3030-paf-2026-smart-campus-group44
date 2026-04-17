import axios from 'axios'
import { API_BASE } from '../utils/constants'
import { emitAuthLogout } from '../utils/authEvents'

const isUnexpectedHtmlApiResponse = (response) => {
  const contentType = response?.headers?.['content-type'] || ''
  const url = response?.config?.url || ''
  return url.startsWith('/api') && contentType.includes('text/html')
}

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosInstance.interceptors.response.use(
  (response) => {
    if (isUnexpectedHtmlApiResponse(response)) {
      localStorage.clear()
      emitAuthLogout()
      return Promise.reject(new Error('Unauthorized HTML response for API request'))
    }
    return response
  },
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        localStorage.clear()
        emitAuthLogout()
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(`${API_BASE}/api/v1/auth/refresh`, { refreshToken })
        localStorage.setItem('accessToken',  data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return axiosInstance(original)
      } catch {
        localStorage.clear()
        emitAuthLogout()
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance