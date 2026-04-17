import { useState } from 'react'

const BookingForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({
    resourceId: '',
    resourceName: '',
    resourceType: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: '',
  })

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      resourceId: Number(form.resourceId),
      resourceName: form.resourceName,
      resourceType: form.resourceType,
      location: form.location,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      purpose: form.purpose,
      attendees: form.attendees ? Number(form.attendees) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-stone-900">Request a new booking</h2>
        <p className="text-sm text-stone-500 mt-1">Submit a reservation request for a campus resource.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Resource ID</label>
          <input
            type="number"
            value={form.resourceId}
            onChange={handleChange('resourceId')}
            placeholder="e.g. 101"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Resource name</label>
          <input
            type="text"
            value={form.resourceName}
            onChange={handleChange('resourceName')}
            placeholder="Lecture Hall A"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Resource type</label>
          <input
            type="text"
            value={form.resourceType}
            onChange={handleChange('resourceType')}
            placeholder="Lecture hall, lab, equipment"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={handleChange('location')}
            placeholder="Main building"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={handleChange('date')}
            className="input-field"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Start time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={handleChange('startTime')}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">End time</label>
            <input
              type="time"
              value={form.endTime}
              onChange={handleChange('endTime')}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-2">Purpose</label>
          <textarea
            value={form.purpose}
            onChange={handleChange('purpose')}
            placeholder="E.g. project presentation rehearsal"
            className="input-field min-h-[120px] resize-none"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-2">Attendees</label>
          <input
            type="number"
            value={form.attendees}
            onChange={handleChange('attendees')}
            placeholder="Number of attendees"
            className="input-field"
            min="1"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Submitting request...' : 'Send booking request'}
      </button>
    </form>
  )
}

export default BookingForm
