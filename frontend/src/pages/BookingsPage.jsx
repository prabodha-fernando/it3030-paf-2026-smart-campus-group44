import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../components/common/Layout'
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

  const filteredBookings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return bookings
    return bookings.filter((booking) =>
      booking.resourceName?.toLowerCase().includes(term) ||
      booking.location?.toLowerCase().includes(term) ||
      booking.requestedByEmail?.toLowerCase().includes(term)
    )
  }, [bookings, searchTerm])

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    try {
      await createBooking(payload)
      toast.success('Booking request submitted')
      setRefreshKey((prev) => prev + 1)
      setSearchTerm('')
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
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-stone-500">Booking management</p>
            <h1 className="text-2xl font-semibold text-stone-900">Manage reservations</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ViewToggle view={view} onViewChange={setView} />
            <div className="flex flex-wrap gap-3">
              {statusOptions.map((status) => (
                <StatusPill
                  key={status.value}
                  status={status.value}
                  active={status.value === statusFilter}
                  onClick={setStatusFilter}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="space-y-6">
            <div className="card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    {view === 'list' ? 'Bookings overview' : 'Calendar view'}
                  </h2>
                  <p className="text-sm text-stone-500 mt-1">
                    {view === 'list'
                      ? 'Review requests, approve pending items, and cancel bookings.'
                      : 'Visual calendar view of all bookings and reservations.'
                    }
                  </p>
                </div>
                {view === 'list' && (
                  <div className="flex items-center gap-2">
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search resource, location or requester"
                      className="input-field"
                    />
                  </div>
                )}
              </div>
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
                  // Could open a modal or navigate to booking details
                  toast.success(`Selected: ${booking.resourceName}`)
                }}
              />
            )}
          </div>

          <div className="space-y-6">
            <BookingForm onSubmit={handleSubmit} loading={submitting} />

            <div className="card bg-slate-50 border-slate-200">
              <h2 className="text-lg font-semibold text-stone-900">How booking works</h2>
              <ol className="mt-4 space-y-3 text-sm text-stone-600 list-decimal list-inside">
                <li>Submit your request with resource details, date and time.</li>
                <li>Admin reviews the request and approves or rejects it.</li>
                <li>Approved bookings may be cancelled if plans change.</li>
                <li>Notifications keep you updated on booking status changes.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default BookingsPage
