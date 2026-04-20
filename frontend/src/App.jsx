import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'
import NotificationDrawer from './components/notifications/NotificationDrawer'
import LoadingSpinner from './components/common/LoadingSpinner'
import useWebSocket from './hooks/useWebSocket'
import useAuth from './hooks/useAuth'
import HomePage from './pages/HomePage'
import LoginPage         from './pages/LoginPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import OnboardingPage    from './pages/OnboardingPage'
import DashboardPage     from './pages/DashboardPage'
import BookingsPage      from './pages/BookingsPage'
import ProfilePage       from './pages/ProfilePage'
import AdminUsersPage    from './pages/AdminUsersPage'
import ResourcesPage     from './pages/ResourcesPage'
import TicketsPage       from './pages/TicketsPage'

const AppContent = () => {
  const { user, loading, isAuthenticated } = useAuth()
  useWebSocket(user?.email)

  if (loading) return <LoadingSpinner center />

  return (
    <>
      <NotificationDrawer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/bookings"   element={<BookingsPage />} />
          <Route path="/resources"  element={<ResourcesPage />} />
          <Route path="/tickets"    element={<TicketsPage />} />
          <Route path="/profile"    element={<ProfilePage />} />
          <Route path="/profile/notifications" element={<ProfilePage />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>

        {/*<Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />*/}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1C1917',
            color: '#FAFAF9',
            fontSize: '13px',
            borderRadius: '10px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#059669', secondary: '#FAFAF9' } },
          error:   { iconTheme: { primary: '#DC2626', secondary: '#FAFAF9' } },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
)

export default App