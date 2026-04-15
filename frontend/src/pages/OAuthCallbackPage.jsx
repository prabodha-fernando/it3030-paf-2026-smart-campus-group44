import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { getMyProfile } from '../api/authApi'
import LoadingSpinner from '../components/common/LoadingSpinner'

const OAuthCallbackPage = () => {
  const navigate   = useNavigate()
  const { login }  = useAuthContext()

  useEffect(() => {
    const params       = new URLSearchParams(window.location.search)
    const token        = params.get('token')
    const refreshToken = params.get('refreshToken')
    const firstLogin   = params.get('firstLogin') === 'true'

    if (!token) { navigate('/login?error=auth_failed', { replace: true }); return }

    localStorage.setItem('accessToken',  token)
    localStorage.setItem('refreshToken', refreshToken)

    getMyProfile()
      .then(({ data }) => {
        login(token, refreshToken, data)
        navigate(firstLogin ? '/onboarding' : '/dashboard', { replace: true })
      })
      .catch(() => navigate('/login?error=auth_failed', { replace: true }))
  }, [])

  return <LoadingSpinner center />
}

export default OAuthCallbackPage