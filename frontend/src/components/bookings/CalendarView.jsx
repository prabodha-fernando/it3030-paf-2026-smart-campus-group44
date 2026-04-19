import { useEffect, useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { getCalendarEvents } from '../../api/bookingApi'
import BookingStatusBadge from './BookingStatusBadge'
import BookingDetailsModal from './BookingDetailsModal'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Setup the localizer for react-big-calendar
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
})

const CalendarView = ({ statusFilter, onEventClick }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Load events for the current month +/- some buffer
  const loadEvents = async (start, end) => {
    setLoading(true)
    try {
      const startDate = format(start, 'yyyy-MM-dd')
      const endDate = format(end, 'yyyy-MM-dd')
      const params = {
        startDate,
        endDate,
        ...(statusFilter && { status: statusFilter })
      }

      const { data } = await getCalendarEvents(params)
      // Handle both paginated and non-paginated responses
      const eventsData = data.content || data
      const calendarEvents = eventsData.map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        resource: event,
      }))
      setEvents(calendarEvents)
    } catch (error) {
      console.error('Calendar API error:', error)
      toast.error('Unable to load calendar events')
    } finally {
      setLoading(false)
    }
  }

  // Load events when component mounts or filters change
  useEffect(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    loadEvents(start, end)
  }, [statusFilter])

  // Custom event component for better styling
  const EventComponent = ({ event }) => {
    const booking = event.resource
    return (
      <div className="text-xs p-1 truncate">
        <div className="font-medium">{booking.resourceName}</div>
        <div className="text-stone-600">{booking.purpose}</div>
      </div>
    )
  }

  // Custom toolbar with only navigation buttons (no view toggle buttons)
  const CustomToolbar = ({ label, onNavigate }) => {
    return (
      <div className="rbc-toolbar">
        <div className="rbc-btn-group">
          <button type="button" onClick={() => onNavigate('PREV')}>Previous</button>
          <button type="button" onClick={() => onNavigate('TODAY')}>Today</button>
          <button type="button" onClick={() => onNavigate('NEXT')}>Next</button>
        </div>
        <span className="rbc-toolbar-label">{label}</span>
        <div className="rbc-btn-group">
          {/* View toggle buttons removed */}
        </div>
      </div>
    )
  }

  // Custom event styling based on status
  const eventStyleGetter = (event) => {
    const booking = event.resource
    let backgroundColor = '#6B7280' // default gray

    switch (booking.status) {
      case 'APPROVED':
        backgroundColor = '#10B981' // Professional green
        break
      case 'PENDING':
        backgroundColor = '#F59E0B' // Professional yellow/amber
        break
      case 'REJECTED':
        backgroundColor = '#EF4444' // Professional red
        break
      case 'CANCELLED':
        backgroundColor = '#9CA3AF' // Professional gray
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontWeight: '500'
      }
    }
  }

  // Handle calendar navigation
  const handleNavigate = (date, view) => {
    setCurrentDate(date)
    // Load events for the new date range
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    loadEvents(start, end)
  }

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedBooking(event.resource)
    setModalOpen(true)
    if (onEventClick) onEventClick(event.resource)
  }

  // Handle range change (when user navigates to different months/weeks)
  const handleRangeChange = (range) => {
    if (Array.isArray(range)) {
      // Month/week view with multiple dates
      const start = range[0]
      const end = range[range.length - 1]
      loadEvents(start, end)
    } else {
      // Agenda view with date range object
      loadEvents(range.start, range.end)
    }
  }

  const messages = {
    allDay: 'All Day',
    previous: 'Previous',
    next: 'Next',
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Time',
    event: 'Event',
    noEventsInRange: 'No bookings in this range.',
    showMore: (total) => `+${total} more`,
  }

  return (
    <div className="h-[600px] bg-white rounded-lg border border-stone-200 relative">
      {/* Subtle loading indicator in header */}
      {loading && (
        <div className="absolute top-2 right-2 z-10 bg-white rounded-full px-3 py-1 shadow-sm border border-stone-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-stone-600">Loading...</span>
          </div>
        </div>
      )}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        onNavigate={handleNavigate}
        style={{ height: '100%' }}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
          toolbar: CustomToolbar, // Use custom toolbar with only navigation buttons
        }}
        onRangeChange={handleRangeChange}
        messages={messages}
        views={['month']} // Only allow month view
        defaultView="month"
        popup
        selectable
      />
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}

export default CalendarView