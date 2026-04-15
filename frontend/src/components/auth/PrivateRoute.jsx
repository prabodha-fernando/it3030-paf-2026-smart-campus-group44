import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import LoadingSpinner from '../common/LoadingSpinner'

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) return <LoadingSpinner center />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

export default PrivateRoute