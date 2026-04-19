import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import NotificationDrawer from './components/notifications/NotificationDrawer';
import useWebSocket from './hooks/useWebSocket';
import useAuth from './hooks/useAuth';

// Pages
import LoginPage from './pages/LoginPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';
import ResourcesPage from './pages/ResourcesPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import ResourceCategoryPage from './pages/ResourceCategoryPage';
import CampusMapPage from './pages/CampusMapPage';
import ContactFacilitiesPage from './pages/ContactFacilitiesPage';
import BookingsPage from './pages/BookingsPage';
import TicketsPage from './pages/TicketsPage';

const AppContent = () => {
  const { user, loading, isAuthenticated } = useAuth();

  // Initialize WebSocket connection when authenticated
  useWebSocket(isAuthenticated ? user?.id : null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && <NotificationDrawer />}
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/tickets" element={<TicketsPage />} />

            {/* Facilities Module */}
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/map" element={<CampusMapPage />} />
            <Route path="/resources/halls" element={<ResourceCategoryPage category="halls" />} />
            <Route path="/resources/labs" element={<ResourceCategoryPage category="labs" />} />
            <Route path="/resources/equipment" element={<ResourceCategoryPage category="equipment" />} />
            <Route path="/resources/contact" element={<ContactFacilitiesPage />} />
            <Route path="/resources/:id" element={<ResourceDetailPage />} />

            <Route path="/resources/manage" element={<AdminResourcesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/notifications" element={<ProfilePage />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
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
            error: { iconTheme: { primary: '#DC2626', secondary: '#FAFAF9' } },
          }}
        />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;