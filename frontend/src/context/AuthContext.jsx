import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe } from '../api/authApi'
import { AUTH_LOGOUT_EVENT } from '../utils/authEvents'
import { clearAuthTokens, getAccessToken, setAuthTokens } from '../utils/authStorage'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = getAccessToken()
    if (!token) { setLoading(false); return }
    try {
      const { data } = await getMe()
      setUser(data)
    } catch {
      clearAuthTokens()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  useEffect(() => {
    const handleLogout = () => {
      setUser(null)
      setLoading(false)
    }

    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout)
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout)
  }, [])

  const login = (accessToken, refreshToken, userData) => {
    setAuthTokens(accessToken, refreshToken)
    setUser(userData)
  }

  const logoutUser = () => {
    clearAuthTokens()
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  const refreshUser = async () => {
    try {
      const { data } = await getMe()
      setUser(data)
    } catch { /* silent */ }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logoutUser, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}

export default AuthContext