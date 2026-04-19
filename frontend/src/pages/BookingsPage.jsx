import { useEffect, useMemo, useState } from 'react'
import { startOfToday } from 'date-fns'
import toast from 'react-hot-toast'
import Layout from '../components/common/Layout'
import PageTitle from '../components/common/PageTitle'
import BookingForm from '../components/bookings/BookingForm'
import BookingList from '../components/bookings/BookingList'
import CalendarView from '../components/bookings/CalendarView'
import { getBookings, createBooking, approveBooking, rejectBooking, cancelBooking } from '../api/bookingApi'
import useAuth from '../hooks/useAuth'
import { BOOKING_STATUS_COLORS } from '../utils/constants'

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

const StatusPill = ({ status, active, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(status)}
    className={`px-3 py-2 rounded-full text-sm font-medium transition ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-stone-600 hover:bg-slate-200'}`}
  >
    {status === '' ? 'All' : status}
  </button>
)

const ViewToggle = ({ view, onViewChange }) => (
  <div className="flex bg-slate-100 rounded-lg p-1">
    <button
      type="button"
      onClick={() => onViewChange('list')}
      className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
    >
      List View
    </button>
    <button
      type="button"
      onClick={() => onViewChange('calendar')}
      className={`px-4 py-2 rounded-md text-sm font-medium transition ${view === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
    >
      Calendar View
    </button>
  </div>
)

const BookingsPage = () => {
  const { user, canApproveBookings } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [view, setView] = useState('list') // 'list' or 'calendar'

  const loadBookings = async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      const { data } = await getBookings(params)
      setBookings(data.content || data)
    } catch (error) {
      toast.error('Unable to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBookings() }, [statusFilter, refreshKey])

  const sortedBookings = useMemo(() => {
    const today = startOfToday()
    return [...bookings].sort((a, b) => {
      const aDate = a.date ? new Date(a.date) : new Date(0)
      const bDate = b.date ? new Date(b.date) : new Date(0)
      const aIsPast = aDate < today
      const bIsPast = bDate < today

      if (aIsPast !== bIsPast) {
        return aIsPast ? 1 : -1
      }

      return aDate - bDate
    })
  }, [bookings])

  const statusCounts = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        const status = booking.status?.toUpperCase()
        if (status === 'PENDING') acc.pending += 1
        if (status === 'APPROVED') acc.approved += 1
        if (status === 'REJECTED') acc.rejected += 1
        if (status === 'CANCELLED') acc.cancelled += 1
        return acc
      },
      { pending: 0, approved: 0, rejected: 0, cancelled: 0 }
    )
  }, [bookings])

  const filteredBookings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return sortedBookings
    return sortedBookings.filter((booking) =>
      booking.resourceId?.toLowerCase().includes(term) ||
      booking.resourceName?.toLowerCase().includes(term) ||
      booking.location?.toLowerCase().includes(term) ||
      booking.requestedByEmail?.toLowerCase().includes(term)
    )
  }, [sortedBookings, searchTerm])

  const [showBookingForm, setShowBookingForm] = useState(false)

  const handleFormClose = () => {
    setShowBookingForm(false)
  }

  const handleFormSubmit = async (payload) => {
    setSubmitting(true)
    try {
      await createBooking(payload)
      toast.success('Booking request submitted')
      setRefreshKey((prev) => prev + 1)
      setSearchTerm('')
      handleFormClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id) => {
    const reason = window.prompt('Enter approval note (optional)')
    if (reason === null) return
    try {
      await approveBooking(id, { reason })
      toast.success('Booking approved')
      setRefreshKey((prev) => prev + 1)
    } catch {
      toast.error('Approval failed')
    }
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason')
    if (!reason) return toast.error('Reason required')
    try {
      await rejectBooking(id, { reason })
      toast.success('Booking rejected')
      setRefreshKey((prev) => prev + 1)
    } catch {
      toast.error('Rejection failed')
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await cancelBooking(id)
      toast.success('Booking cancelled')
      setRefreshKey((prev) => prev + 1)
    } catch {
      toast.error('Cancellation failed')
    }
  }

  return (
    <Layout>
      <PageTitle title="Browse Bookings" />
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card p-6 sticky top-6 space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Navigation</p>
              <h2 className="text-xl font-bold text-stone-900 mt-2">Filters & Views</h2>
            </div>

            {/* View Toggle */}
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Display mode</p>
              <ViewToggle view={view} onViewChange={setView} />
            </div>

            {/* Status Filter */}
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Filter by status</p>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setStatusFilter(status.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                      status.value === statusFilter
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-stone-600 hover:bg-slate-200'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-stone-500 font-medium">Booking Management</p>
                <h1 className="text-3xl font-bold text-stone-900 mt-1">Manage Reservations</h1>
              </div>
              <button
                onClick={() => setShowBookingForm(true)}
                className="btn-primary px-6 py-2 whitespace-nowrap"
              >
                + New Booking
              </button>
            </div>

            {/* Status Summary */}
            {view === 'list' && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending requests</p>
                  <p className="mt-3 text-3xl font-semibold text-amber-600">{statusCounts.pending}</p>
                  <p className="mt-2 text-sm text-slate-500">New requests awaiting review</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Approved</p>
                  <p className="mt-3 text-3xl font-semibold text-emerald-600">{statusCounts.approved}</p>
                  <p className="mt-2 text-sm text-slate-500">Confirmed bookings scheduled</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rejected</p>
                  <p className="mt-3 text-3xl font-semibold text-rose-600">{statusCounts.rejected}</p>
                  <p className="mt-2 text-sm text-slate-500">Requests that were declined</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cancelled</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-700">{statusCounts.cancelled}</p>
                  <p className="mt-2 text-sm text-slate-500">Bookings that were cancelled</p>
                </div>
              </div>
            )}
            {/* Search Bar */}
            {view === 'list' && (
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by resource ID, name, location, or requester..."
                  className="input-field w-full pl-10"
                />
                <svg className="absolute left-3 top-3 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="card p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-stone-900">
                {view === 'list' ? 'All Bookings' : 'Calendar View'}
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                {view === 'list'
                  ? `Showing ${filteredBookings.length} booking${filteredBookings.length !== 1 ? 's' : ''}`
                  : 'Visual overview of all bookings and reservations'}
              </p>
            </div>

            {view === 'list' ? (
              <BookingList
                bookings={filteredBookings}
                loading={loading}
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={handleCancel}
                canApprove={canApproveBookings}
              />
            ) : (
              <CalendarView
                statusFilter={statusFilter}
                onEventClick={(booking) => {
                  toast.success(`Selected: ${booking.resourceName}`)
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stone-900">New Booking Request</h2>
              <button
                onClick={handleFormClose}
                className="text-stone-500 hover:text-stone-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <BookingForm onSubmit={handleFormSubmit} loading={submitting} isModal />
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default BookingsPage
