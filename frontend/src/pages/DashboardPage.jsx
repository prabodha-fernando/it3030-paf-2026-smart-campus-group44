import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

import Layout from '../components/common/Layout'
import PageTitle from '../components/common/PageTitle'
import useAuth from '../hooks/useAuth'
import useDashboardStats from '../hooks/useDashboardStats'
import useNotifications from '../hooks/useNotifications'
import { getRoleBadgeClass, getRoleLabel } from '../utils/roleUtils'
import {
  getMyBookings,
  getBookingsPendingApproval,
  approveBooking,
  rejectBooking,
  cancelBooking
} from '../api/bookingApi'
import {
  getMyTickets,
  getOpenTickets,
  getTickets,
  updateTicketStatus,
  updateTicketResolutionNotes
} from '../api/ticketApi'

const QuickActionCard = ({ to, icon, label, desc, color }) => (
  <Link
    to={to}
    className="relative group overflow-hidden bg-white hover:bg-stone-50/50 border border-stone-200/60 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between h-full"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-stone-100/50 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300"></div>
    <div>
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-stone-900 group-hover:text-indigo-600 transition-colors duration-300">{label}</h3>
      <p className="text-xs text-stone-400 mt-1 leading-relaxed">{desc}</p>
    </div>
    <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-4px] group-hover:translate-x-0">
      Launch Console
      <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </Link>
)

const StatusBadge = ({ status, type }) => {
  const isBooking = type === 'booking'
  const normalized = (status || '').toUpperCase()

  let colorClass = 'bg-stone-100 text-stone-600 border-stone-200'
  if (isBooking) {
    if (normalized === 'PENDING') colorClass = 'bg-amber-50 text-amber-700 border-amber-200/50'
    if (normalized === 'APPROVED') colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
    if (normalized === 'REJECTED') colorClass = 'bg-rose-50 text-rose-700 border-rose-200/50'
    if (normalized === 'CANCELLED') colorClass = 'bg-stone-100 text-stone-500 border-stone-200'
  } else {
    if (normalized === 'OPEN') colorClass = 'bg-sky-50 text-sky-700 border-sky-200/50'
    if (normalized === 'IN_PROGRESS') colorClass = 'bg-amber-50 text-amber-700 border-amber-200/50'
    if (normalized === 'RESOLVED') colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
    if (normalized === 'CLOSED') colorClass = 'bg-stone-100 text-stone-500 border-stone-200'
    if (normalized === 'REJECTED') colorClass = 'bg-rose-50 text-rose-700 border-rose-200/50'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {status}
    </span>
  )
}

const PriorityBadge = ({ priority }) => {
  const norm = (priority || 'MEDIUM').toUpperCase()
  let color = 'bg-stone-50 text-stone-600 border-stone-200'
  if (norm === 'LOW') color = 'bg-stone-50 text-stone-600 border-stone-200'
  if (norm === 'MEDIUM') color = 'bg-amber-50 text-amber-700 border-amber-200/50'
  if (norm === 'HIGH') color = 'bg-rose-50 text-rose-700 border-rose-200/50'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider border ${color}`}>
      {norm}
    </span>
  )
}

const DashboardPage = () => {
  const { user, isAdmin, canApproveBookings } = useAuth()
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats()
  const { notifications, handleMarkAsRead, handleMarkAllAsRead, handleDelete } = useNotifications()

  // Local state for lists
  const [bookingsList, setBookingsList] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [ticketsList, setTicketsList] = useState([])
  const [ticketsLoading, setTicketsLoading] = useState(false)

  // Quick Action form inputs
  const [rejectionId, setRejectionId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [resolutionId, setResolutionId] = useState(null)
  const [resolutionNotes, setResolutionNotes] = useState('')

  // Simulated Telemetry State
  const [ping, setPing] = useState(14)
  const [activeSessions, setActiveSessions] = useState(142)

  const hour = new Date().getHours()
  const greeting = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 22 ? 'Good evening' : 'Good night'
  const firstName = user?.displayName?.split(' ')[0] || 'there'
  const currentTimeString = format(new Date(), 'eeee, MMMM d')

  const refreshData = useCallback(async () => {
    if (!user) return
    setBookingsLoading(true)
    setTicketsLoading(true)
    try {
      // 1. Fetch Bookings
      if (canApproveBookings) {
        const res = await getBookingsPendingApproval({ page: 0, size: 5 })
        setBookingsList(res.data.content || [])
      } else {
        const res = await getMyBookings({ page: 0, size: 5 })
        setBookingsList(res.data.content || [])
      }

      // 2. Fetch Tickets
      if (user.role === 'TECHNICIAN') {
        const res = await getTickets()
        // Filter for active technician assigned tickets
        const assigned = res.data.filter(t => t.assignedTo?.id === user.id && ['OPEN', 'IN_PROGRESS'].includes(t.status))
        setTicketsList(assigned.slice(0, 5))
      } else if (isAdmin || user.role === 'FACILITY_MANAGER' || user.role === 'HOD') {
        const res = await getOpenTickets({ page: 0, size: 5 })
        setTicketsList(res.data.content || [])
      } else {
        const res = await getMyTickets({ page: 0, size: 5 })
        setTicketsList(res.data.content || [])
      }
    } catch (err) {
      console.error('Error loading dashboard operations:', err)
    } finally {
      setBookingsLoading(false)
      setTicketsLoading(false)
    }
  }, [user, canApproveBookings, isAdmin])

  // Reload statistics & action lists in parallel
  const handleFullRefresh = async () => {
    const refreshPromise = refreshData()
    const statsPromise = refetchStats()
    await Promise.all([refreshPromise, statsPromise])
    toast.success('Control console telemetry updated')
  }

  // Booking Actions
  const handleBookingApprove = async (id) => {
    try {
      await approveBooking(id, {})
      toast.success('Booking approved successfully')
      refetchStats()
      refreshData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve booking')
    }
  }

  const handleBookingReject = async (id) => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required')
      return
    }
    try {
      await rejectBooking(id, { adminReason: rejectionReason.trim() })
      toast.success('Booking request rejected')
      setRejectionId(null)
      setRejectionReason('')
      refetchStats()
      refreshData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject booking')
    }
  }

  const handleBookingCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    try {
      await cancelBooking(id)
      toast.success('Booking cancelled successfully')
      refetchStats()
      refreshData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel booking')
    }
  }

  // Ticket Actions
  const handleTicketStartProgress = async (id) => {
    try {
      await updateTicketStatus(id, { status: 'IN_PROGRESS' })
      toast.success('Ticket status changed to In Progress')
      refreshData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update ticket status')
    }
  }

  const handleTicketResolve = async (id) => {
    if (!resolutionNotes.trim()) {
      toast.error('Resolution notes are required to resolve a ticket')
      return
    }
    try {
      await updateTicketResolutionNotes(id, resolutionNotes.trim())
      await updateTicketStatus(id, { status: 'RESOLVED' })
      toast.success('Ticket successfully resolved')
      setResolutionId(null)
      setResolutionNotes('')
      refetchStats()
      refreshData()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resolve ticket')
    }
  }

  // Initial load
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Live Telemetry Oscillations
  useEffect(() => {
    const interval = setInterval(() => {
      setPing(prev => {
        const diff = Math.random() > 0.5 ? 1 : -1
        const next = prev + diff
        return next < 8 ? 8 : next > 25 ? 25 : next
      })
      setActiveSessions(prev => {
        const diff = Math.floor(Math.random() * 3) - 1
        const next = prev + diff
        return next < 120 ? 120 : next > 180 ? 180 : next
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Layout>
      <PageTitle title="Dashboard" />
      <div className="space-y-6">

        {/* 1. Header Hero Widget */}
        <div className="relative overflow-hidden bg-gradient-to-r from-stone-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-950/20">
          {/* Glowing Network Mesh Overlay */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="node-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#node-grid)" />
              <circle cx="15%" cy="30%" r="3" className="fill-indigo-400 animate-pulse" />
              <circle cx="85%" cy="70%" r="4" className="fill-emerald-400 animate-pulse [animation-delay:1.5s]" />
              <circle cx="50%" cy="80%" r="2" className="fill-cyan-400 animate-pulse [animation-delay:0.8s]" />
              <line x1="15%" y1="30%" x2="50%" y2="80%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4" />
              <line x1="50%" y1="80%" x2="85%" y2="70%" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4" />
            </svg>
          </div>

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <p className="text-xs uppercase tracking-wider text-indigo-200/90 font-bold">Smart Campus Terminal</p>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {greeting}, {firstName} 👋
              </h1>
              <p className="text-sm text-stone-300 max-w-xl">
                Welcome to your control command center. View live network signals, review system logs, and dispatch active operations.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
              <span className={`badge ${getRoleBadgeClass(user?.role)} text-xs px-3.5 py-1 font-semibold uppercase tracking-wider shadow-sm`}>
                {getRoleLabel(user?.role)}
              </span>
              <p className="text-xs text-stone-300 font-medium">
                {currentTimeString}
              </p>
            </div>
          </div>
        </div>

        {/* Sync/Error Banner */}
        {statsError && (
          <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-200 text-xs font-semibold">
            Telemetry synchronization warning: {statsError}. Reconnecting automatically...
          </div>
        )}

        {/* 2. System Heartbeat & Heartbeat console */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-stone-900 via-stone-900 to-indigo-950 text-indigo-50 border border-stone-800 rounded-3xl p-6 shadow-lg relative flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-300">Live Telemetry Diagnostics</h2>
                </div>
                <button
                  onClick={handleFullRefresh}
                  className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-indigo-200 transition-colors"
                  title="Reload console metrics"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">API latency</p>
                  <p className="text-lg font-bold text-stone-200 mt-0.5">{ping}ms</p>
                  <p className="text-[10px] text-emerald-400 flex items-center justify-center md:justify-start gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400"></span> Optimal
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Websocket link</p>
                  <p className="text-lg font-bold text-stone-200 mt-0.5">CONNECTED</p>
                  <p className="text-[10px] text-emerald-400 flex items-center justify-center md:justify-start gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Stream
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Active sessions</p>
                  <p className="text-lg font-bold text-stone-200 mt-0.5">{activeSessions}</p>
                  <p className="text-[10px] text-indigo-400">Live campus users</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Gateway Health</p>
                  <p className="text-lg font-bold text-stone-200 mt-0.5">99.98%</p>
                  <p className="text-[10px] text-emerald-400">No packet losses</p>
                </div>
              </div>
            </div>

            {/* Signal visualizer waves */}
            <div className="mt-6 flex items-end justify-between gap-1 bg-stone-950/40 rounded-xl p-3 border border-stone-850">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-400 tracking-wider">NETWORK NODE SIGNAL:</span>
                <span className="text-[10px] text-stone-400 font-mono">SECURE_LINK_256</span>
              </div>
              <div className="flex items-end gap-1.5 h-7">
                <div className="w-1 bg-emerald-500/80 rounded-full animate-bounce [animation-delay:0.1s] h-3"></div>
                <div className="w-1 bg-indigo-500/90 rounded-full animate-bounce [animation-delay:0.3s] h-6"></div>
                <div className="w-1 bg-indigo-400/80 rounded-full animate-bounce [animation-delay:0.5s] h-4"></div>
                <div className="w-1 bg-emerald-400/90 rounded-full animate-bounce [animation-delay:0.2s] h-7"></div>
                <div className="w-1 bg-indigo-500/90 rounded-full animate-bounce [animation-delay:0.4s] h-5"></div>
                <div className="w-1 bg-emerald-500/80 rounded-full animate-bounce [animation-delay:0.6s] h-3"></div>
                <div className="w-1 bg-indigo-400/90 rounded-full animate-bounce [animation-delay:0.15s] h-5"></div>
                <div className="w-1 bg-indigo-500/80 rounded-full animate-bounce [animation-delay:0.35s] h-7"></div>
              </div>
            </div>
          </div>

          {/* Quick Stats overview cards */}
          <div className="bg-white border border-stone-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">Quick Metrics Status</h2>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 font-bold px-2 py-0.5 rounded-md">Live Stream</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-50/70 p-3 rounded-2xl border border-stone-100">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">My Bookings</span>
                {statsLoading ? (
                  <div className="h-6 w-12 bg-stone-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <span className="text-2xl font-black text-stone-800">{stats.myBookings}</span>
                )}
              </div>
              <div className="bg-stone-50/70 p-3 rounded-2xl border border-stone-100">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Pending Review</span>
                {statsLoading ? (
                  <div className="h-6 w-12 bg-stone-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <span className="text-2xl font-black text-amber-600">{stats.pendingApproval}</span>
                )}
              </div>
              <div className="bg-stone-50/70 p-3 rounded-2xl border border-stone-100">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Open Tickets</span>
                {statsLoading ? (
                  <div className="h-6 w-12 bg-stone-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <span className="text-2xl font-black text-sky-600">{stats.openTickets}</span>
                )}
              </div>
              <div className="bg-stone-50/70 p-3 rounded-2xl border border-stone-100">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Alert Feed</span>
                {statsLoading ? (
                  <div className="h-6 w-12 bg-stone-200 animate-pulse rounded mt-1"></div>
                ) : (
                  <span className="text-2xl font-black text-indigo-600">{stats.notifications}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Action Cards Row */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3.5">Campus Command Hub</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard
              to="/resources"
              icon={
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              label="Book Resource"
              desc="Book study rooms, labs, auditoriums"
              color="bg-emerald-600"
            />
            <QuickActionCard
              to="/bookings"
              icon={
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              label="Manage Reservations"
              desc="View, adjust and track reservations"
              color="bg-indigo-600"
            />
            <QuickActionCard
              to="/tickets"
              icon={
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              label="Service Hotline"
              desc="File maintenance & network requests"
              color="bg-amber-600"
            />
            {isAdmin ? (
              <QuickActionCard
                to="/admin/users"
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                label="Identity Access"
                desc="Manage system roles & authorizations"
                color="bg-stone-800"
              />
            ) : (
              <QuickActionCard
                to="/profile"
                icon={
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                label="Personal Profile"
                desc="Manage your settings & requests"
                color="bg-stone-600"
              />
            )}
          </div>
        </div>

        {/* 4. Main Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Bookings Actions Console */}
          <div className="lg:col-span-7 bg-white border border-stone-200/60 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  {canApproveBookings ? 'Pending Approvals Queue' : 'My Upcoming Reservations'}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {canApproveBookings
                    ? 'Review and authorize pending campus reservations'
                    : 'Track your upcoming room bookings and resource claims'}
                </p>
              </div>
              <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                {bookingsList.length} total
              </span>
            </div>

            {bookingsLoading ? (
              <div className="space-y-3 py-6">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : bookingsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-stone-100 rounded-2xl">
                <svg className="w-12 h-12 text-stone-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-semibold text-stone-700">No active bookings</p>
                <p className="text-xs text-stone-400 mt-1">There are no bookings requiring immediate attention.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingsList.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 border border-stone-150 rounded-2xl bg-stone-50/30 hover:bg-stone-50/70 hover:border-indigo-200/50 transition-all duration-300 relative"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-2 items-center">
                          <h4 className="text-sm font-bold text-stone-850">{booking.resourceName}</h4>
                          <StatusBadge status={booking.status} type="booking" />
                        </div>
                        <p className="text-xs text-stone-400 font-medium">
                          {booking.resourceType || 'Resource'} · {booking.location}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-stone-700">
                          {booking.date ? format(new Date(booking.date), 'eee, MMM d') : '—'}
                        </p>
                        <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                          {booking.startTime} – {booking.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 bg-white border border-stone-100 rounded-xl p-3 text-xs text-stone-600 leading-relaxed shadow-xs">
                      <span className="font-semibold text-stone-700">Purpose:</span> {booking.purpose}
                      {booking.attendees && (
                        <span className="block text-[10px] text-stone-450 mt-1 font-medium">
                          Estimated Attendees: {booking.attendees} · Requester: {booking.requestedByEmail}
                        </span>
                      )}
                    </div>

                    {/* Inline Rejection Drawer */}
                    {rejectionId === booking.id ? (
                      <div className="mt-4 p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-3">
                        <label className="block text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                          Rejection Reason Notes Required
                        </label>
                        <input
                          type="text"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g. Schedule clash with executive guest seminar..."
                          className="w-full text-xs p-2.5 rounded-lg border border-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
                          maxLength={500}
                        />
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            onClick={() => {
                              setRejectionId(null)
                              setRejectionReason('')
                            }}
                            className="px-3 py-1.5 rounded-lg hover:bg-stone-100 text-stone-500 font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleBookingReject(booking.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                          >
                            Confirm Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {booking.status === 'PENDING' && canApproveBookings && (
                          <>
                            <button
                              onClick={() => handleBookingApprove(booking.id)}
                              className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectionId(booking.id)}
                              className="text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 px-3.5 py-1.5 rounded-xl transition-colors"
                            >
                              Reject Request
                            </button>
                          </>
                        )}

                        {booking.status !== 'CANCELLED' && booking.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleBookingCancel(booking.id)}
                            className="text-xs font-bold text-stone-500 hover:text-stone-700 hover:bg-stone-100 px-3 py-1.5 rounded-xl transition-all"
                          >
                            Cancel Reservation
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tickets Actions Queue */}
          <div className="lg:col-span-5 bg-white border border-stone-200/60 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  {user?.role === 'TECHNICIAN' ? 'My assigned tasks' : 'Campus Service Tickets'}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {user?.role === 'TECHNICIAN'
                    ? 'Maintenance tickets directly assigned to your badge'
                    : 'Status log of active service requests'}
                </p>
              </div>
              <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                {ticketsList.length} active
              </span>
            </div>

            {ticketsLoading ? (
              <div className="space-y-3 py-6">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-stone-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : ticketsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-stone-100 rounded-2xl">
                <svg className="w-12 h-12 text-stone-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10" />
                </svg>
                <p className="text-sm font-semibold text-stone-700">All services clear</p>
                <p className="text-xs text-stone-400 mt-1">No maintenance reports in your dispatch queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ticketsList.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 border border-stone-150 rounded-2xl bg-stone-50/30 hover:bg-stone-50/70 hover:border-indigo-200/50 transition-all duration-300"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono tracking-wider">
                          Ticket #{ticket.id}
                        </span>
                        <PriorityBadge priority={ticket.priority} />
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          {ticket.category}
                        </h4>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {ticket.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-stone-400 font-medium">
                        <span>Loc: {ticket.resourceOrLocation || 'Campus'}</span>
                        <StatusBadge status={ticket.status} type="ticket" />
                      </div>
                    </div>

                    {/* Inline Resolution Notes Drawer */}
                    {resolutionId === ticket.id ? (
                      <div className="mt-4 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3">
                        <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          Resolution Summary Notes Required
                        </label>
                        <textarea
                          rows={2}
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Provide repair details (e.g. replaced burnt safety switch)..."
                          className="w-full text-xs p-2.5 rounded-lg border border-emerald-250 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                          maxLength={3000}
                        />
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            onClick={() => {
                              setResolutionId(null)
                              setResolutionNotes('')
                            }}
                            className="px-3 py-1.5 rounded-lg hover:bg-stone-100 text-stone-500 font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleTicketResolve(ticket.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                          >
                            Complete & Resolve
                          </button>
                        </div>
                      </div>
                    ) : (
                      user?.role === 'TECHNICIAN' && (
                        <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center gap-2">
                          {ticket.status === 'OPEN' && (
                            <button
                              onClick={() => handleTicketStartProgress(ticket.id)}
                              className="text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Start Progress
                            </button>
                          )}
                          {ticket.status === 'IN_PROGRESS' && (
                            <button
                              onClick={() => setResolutionId(ticket.id)}
                              className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Resolve Ticket
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 5. Notification Heartbeat Feed */}
        <div className="bg-white border border-stone-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-stone-900">Notifications & Alert Feeds</h2>
              <p className="text-xs text-stone-400 mt-0.5">Real-time alerts generated from campus activities</p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-850 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs flex flex-col items-center justify-center">
              <svg className="w-8 h-8 text-stone-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              No unread alerts in console feed.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                    n.read
                      ? 'bg-stone-50/50 border-stone-150 text-stone-500'
                      : 'bg-indigo-50/20 border-indigo-100 text-stone-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className={`text-xs font-bold ${n.read ? 'text-stone-600' : 'text-stone-850'}`}>{n.title}</p>
                    <p className="text-xs text-stone-500">{n.message}</p>
                    <p className="text-[10px] text-stone-400 font-medium">
                      Category: {n.category || 'System'} · Priority: {n.priority || 'LOW'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!n.read && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 px-2.5 py-1 rounded-lg"
                      >
                        Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="text-[10px] font-bold text-stone-400 hover:text-stone-600 hover:bg-stone-100 p-1.5 rounded-lg"
                      title="Dismiss alert"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}

export default DashboardPage