import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/auth/PrivateRoute'
import NotificationDrawer from './components/notifications/NotificationDrawer'
import useWebSocket from './hooks/useWebSocket'
import useAuth from './hooks/useAuth'

import LoginPage            from './pages/LoginPage'
import OAuthCallbackPage    from './pages/OAuthCallbackPage'
import OnboardingPage       from './pages/OnboardingPage'
import DashboardPage        from './pages/DashboardPage'
import ProfilePage          from './pages/ProfilePage'
import AdminUsersPage       from './pages/AdminUsersPage'
import ResourcesPage        from './pages/ResourcesPage'
import ResourceDetailPage   from './pages/ResourceDetailPage'
import AdminResourcesPage   from './pages/AdminResourcesPage'
import ResourceCategoryPage from './pages/ResourceCategoryPage'
import CampusMapPage        from './pages/CampusMapPage'
import ContactFacilitiesPage from './pages/ContactFacilitiesPage'

const AppContent = () => {
  const { user } = useAuth()
  useWebSocket(user?.email)

  return (
    <>
      <NotificationDrawer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/onboarding"            element={<OnboardingPage />} />
          <Route path="/dashboard"             element={<DashboardPage />} />
          <Route path="/resources"             element={<ResourcesPage />} />
          <Route path="/resources/manage"        element={<AdminResourcesPage />} />
          <Route path="/resources/map"           element={<CampusMapPage />} />
          <Route path="/resources/halls"         element={<ResourceCategoryPage category="halls" />} />
          <Route path="/resources/labs"          element={<ResourceCategoryPage category="labs" />} />
          <Route path="/resources/equipment"     element={<ResourceCategoryPage category="equipment" />} />
          <Route path="/resources/contact"       element={<ContactFacilitiesPage />} />
          <Route path="/resources/:id"            element={<ResourceDetailPage />} />
          <Route path="/profile"                  element={<ProfilePage />} />
          <Route path="/profile/notifications"    element={<ProfilePage />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
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