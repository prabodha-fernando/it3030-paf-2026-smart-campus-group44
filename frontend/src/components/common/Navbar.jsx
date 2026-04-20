import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import NotificationBell from '../notifications/NotificationBell'
import { logout } from '../../api/authApi'
import { getRoleLabel, getRoleBadgeClass, getInitials } from '../../utils/roleUtils'
import toast from 'react-hot-toast'
import { getRefreshToken } from '../../utils/authStorage'

const Navbar = () => {
  const { user, logoutUser, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const menuRef = useRef(null)


  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setAvatarLoadFailed(false)
  }, [user?.photoUrl])

  const handleLogout = async () => {
    const refreshToken = getRefreshToken()
    try { await logout(refreshToken) } catch { /* silent */ }
    logoutUser()
    navigate('/login')
    toast.success('Signed out successfully')
  }



  const navLinks = [
    { label: 'Dashboard',  to: '/dashboard' },
    { label: 'Resources',  to: '/resources' },
    { label: 'Bookings',   to: '/bookings' },
    { label: 'Tickets',    to: '/tickets' },
    ...(isAdmin ? [{ label: 'Users', to: '/admin/users' }] : []),
  ]

  const isActive = (to) => location.pathname.startsWith(to)

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">Smart Campus</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-primary-400 bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <NotificationBell />

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {user?.photoUrl && !avatarLoadFailed ? (
                  <img
                    src={user.photoUrl}
                    alt={user.displayName}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-primary-600"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                    {getInitials(user?.displayName)}
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <p className="text-white text-xs font-medium leading-tight">{user?.displayName || 'User'}</p>
                  <span className={`badge text-[10px] ${getRoleBadgeClass(user?.role)}`}>
                    {getRoleLabel(user?.role)}
                  </span>
                </div>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-stone-200 shadow-lg py-1 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-stone-100">
                    <p className="text-sm font-medium text-stone-900">{user?.displayName}</p>
                    <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My profile
                  </Link>
                  <Link to="/profile/notifications" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Notification settings
                  </Link>
                  <div className="border-t border-stone-100 mt-1">
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar