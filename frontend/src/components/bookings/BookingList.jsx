import BookingStatusBadge from './BookingStatusBadge'
import { format } from 'date-fns'

const BookingList = ({ bookings, loading, onApprove, onReject, onCancel, canApprove }) => {
  if (loading) {
    return (
      <div className="card text-center text-sm text-stone-500">Loading bookings...</div>
    )
  }

  if (!bookings.length) {
    return (
      <div className="card text-center text-sm text-stone-500">
        No bookings found. Create your first request to get started.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="card border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <h3 className="text-base font-semibold text-stone-900">{booking.resourceName || 'Resource'}</h3>
                <BookingStatusBadge status={booking.status} />
              </div>
              <p className="text-sm text-stone-500">{booking.resourceType || 'Resource type not specified'} · {booking.location || 'Unknown location'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-stone-500">
                <div>
                  <p className="font-medium text-stone-700">Date</p>
                  <p>{booking.date ? format(new Date(booking.date), 'eee, MMM d, yyyy') : '—'}</p>
                </div>
                <div>
                  <p className="font-medium text-stone-700">Time</p>
                  <p>{booking.startTime} – {booking.endTime}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-sm text-stone-500 text-right min-w-[220px]">
              <div>
                <p className="font-medium text-stone-700">Requested by</p>
                <p>{booking.requestedByEmail}</p>
              </div>
              <div>
                <p className="font-medium text-stone-700">Attendees</p>
                <p>{booking.attendees || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-stone-100 pt-4 text-sm text-stone-600">
            <p className="font-medium text-stone-700">Purpose</p>
            <p>{booking.purpose}</p>
            {booking.adminReason && (
              <p className="mt-2 text-sm text-stone-500">
                <span className="font-medium">Admin note:</span> {booking.adminReason}
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {booking.status === 'PENDING' && canApprove && (
              <>
                <button onClick={() => onApprove(booking.id)} className="btn-primary px-4 py-2 text-sm">Approve</button>
                <button onClick={() => onReject(booking.id)} className="btn-secondary px-4 py-2 text-sm">Reject</button>
              </>
            )}
            {booking.status !== 'CANCELLED' && booking.status !== 'REJECTED' && (
              <button onClick={() => onCancel(booking.id)} className="btn-secondary px-4 py-2 text-sm">
                Cancel booking
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default BookingList
