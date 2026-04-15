import Layout from '../components/common/Layout'
import useAuth from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { getRoleBadgeClass, getRoleLabel } from '../utils/roleUtils'

const QuickAction = ({ to, icon, label, desc, color }) => (
  <Link to={to} className="card hover:border-primary-200 hover:shadow-sm transition-all group">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
      {icon}
    </div>
    <p className="text-sm font-medium text-stone-900">{label}</p>
    <p className="text-xs text-stone-400 mt-0.5">{desc}</p>
  </Link>
)

const DashboardPage = () => {
  const { user, isAdmin } = useAuth()

  return (
    <Layout>
      <div className="space-y-6">

        {/* Welcome */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">
              Good morning, {user?.displayName?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">Here's what's happening on campus today.</p>
          </div>
          <span className={`badge ${getRoleBadgeClass(user?.role)}`}>
            {getRoleLabel(user?.role)}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'My bookings', value: '3', color: 'text-primary-600', bg: 'bg-primary-50' },
            { label: 'Pending approval', value: '1', color: 'text-accent-600', bg: 'bg-accent-50' },
            { label: 'Open tickets', value: '2', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Notifications', value: '4', color: 'text-stone-600', bg: 'bg-stone-50' },
          ].map((stat) => (
            <div key={stat.label} className={`card ${stat.bg} border-0`}>
              <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-stone-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-medium text-stone-700 mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction to="/resources" icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>}
              label="Book a resource" desc="Reserve halls, labs, rooms" color="bg-primary-600" />

            <QuickAction to="/bookings" icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>}
              label="My bookings" desc="View and manage bookings" color="bg-blue-600" />

            <QuickAction to="/tickets" icon={
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>}
              label="Report issue" desc="Submit a maintenance ticket" color="bg-accent-600" />

            {isAdmin ? (
              <QuickAction to="/admin/users" icon={
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>}
                label="Manage users" desc="Roles and permissions" color="bg-slate-700" />
            ) : (
              <QuickAction to="/profile" icon={
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>}
                label="My profile" desc="Update your details" color="bg-stone-500" />
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default DashboardPage