import { BOOKING_STATUS_COLORS } from '../../utils/constants'

const statusIcons = {
  PENDING: '⏳',
  APPROVED: '✅',
  REJECTED: '❌',
  CANCELLED: '⛔',
}

const BookingStatusBadge = ({ status }) => (
  <span className={`badge ${BOOKING_STATUS_COLORS[status] || 'bg-slate-100 text-slate-700'} flex items-center gap-1 whitespace-nowrap`}>
    <span>{statusIcons[status]}</span>
    <span>{status}</span>
  </span>
)

export default BookingStatusBadge
