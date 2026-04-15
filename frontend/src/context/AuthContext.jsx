import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe } from '../api/authApi'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await getMe()
      setUser(data)
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = (accessToken, refreshToken, userData) => {
    localStorage.setItem('accessToken',  accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(userData)
  }

  const logoutUser = () => {
    localStorage.clear()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const { data } = await getMe()
      setUser(data)
    } catch { /* silent */ }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logoutUser, refreshUser }}>
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