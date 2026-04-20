import { useState } from 'react'
import { format } from 'date-fns'
import BookingStatusBadge from './BookingStatusBadge'

const BookingDetailsModal = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-stone-900">Booking Details</h3>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-medium text-stone-900">{booking.resourceName}</h4>
              <BookingStatusBadge status={booking.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-stone-700">Resource Type</p>
                <p className="text-stone-600">{booking.resourceType || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-stone-700">Location</p>
                <p className="text-stone-600">{booking.location || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-stone-700">Date</p>
                <p className="text-stone-600">
                  {booking.date ? format(new Date(booking.date), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-medium text-stone-700">Time</p>
                <p className="text-stone-600">{booking.startTime} - {booking.endTime}</p>
              </div>
              <div>
                <p className="font-medium text-stone-700">Attendees</p>
                <p className="text-stone-600">{booking.attendees || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-stone-700">Requested By</p>
                <p className="text-stone-600">{booking.requestedByEmail}</p>
              </div>
            </div>

            {booking.purpose && (
              <div>
                <p className="font-medium text-stone-700">Purpose</p>
                <p className="text-stone-600 mt-1">{booking.purpose}</p>
              </div>
            )}

            {booking.adminReason && (
              <div>
                <p className="font-medium text-stone-700">Admin Note</p>
                <p className="text-stone-600 mt-1">{booking.adminReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetailsModal