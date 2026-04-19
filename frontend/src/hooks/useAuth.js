import { useAuthContext } from '../context/AuthContext'
import { isAdmin, canApproveBookings, canManageTickets } from '../utils/roleUtils'

const useAuth = () => {
  const { user, loading, login, logoutUser, refreshUser, updateUser } = useAuthContext()
  return {
    user,
    loading,
    login,
    logoutUser,
    refreshUser,
    updateUser,
    isAuthenticated:      !!user,
    isAdmin:              user ? isAdmin(user.role)              : false,
    canApproveBookings:   user ? canApproveBookings(user.role)   : false,
    canManageTickets:     user ? canManageTickets(user.role)      : false,
    hasRole: (roles) => user ? roles.includes(user.role)         : false,
  }
}

export default useAuth