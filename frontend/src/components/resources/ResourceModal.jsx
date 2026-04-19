import { useState, useEffect } from 'react'

const InputField = ({ label, icon, error, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
      {icon}
      {label}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400 font-medium">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    )}
  </div>
)

const inputClass = (hasError) =>
  `w-full bg-slate-800/60 border ${hasError ? 'border-red-500/70 focus:ring-red-500/30' : 'border-slate-700/80 focus:ring-primary-500/30'} rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/70 focus:ring-2 transition-all`

const SectionDivider = ({ label }) => (
  <div className="flex items-center gap-3 -mx-1">
    <div className="flex-1 h-px bg-slate-800" />
    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{label}</span>
    <div className="flex-1 h-px bg-slate-800" />
  </div>
)

const ResourceModal = ({ isOpen, onClose, onSubmit, isEditing, resource }) => {
  const defaultFormState = {
    name: '',
    type: '',
    capacity: 1,
    location: '',
    status: 'ACTIVE',
    availabilityStart: '08:00:00',
    availabilityEnd: '18:00:00',
    description: ''
  }

  const [formData, setFormData] = useState(defaultFormState)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setFormData(resource ? {
        name: resource.name || '',
        type: resource.type || '',
        capacity: resource.capacity || 1,
        location: resource.location || '',
        status: resource.status || 'ACTIVE',
        availabilityStart: resource.availabilityStart || '08:00:00',
        availabilityEnd: resource.availabilityEnd || '18:00:00',
        description: resource.description || ''
      } : defaultFormState)
      setErrors({})
    }
  }, [isOpen, resource])

  if (!isOpen) return null

  const validate = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Name is required'
    if (!formData.type.trim()) errs.type = 'Type is required'
    if (formData.capacity < 1) errs.capacity = 'Capacity must be at least 1'
    if (!formData.location.trim()) errs.location = 'Location is required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    onSubmit(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-800/80 shadow-2xl shadow-black/50 flex flex-col max-h-[92vh]">

        {/* Modal Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center">
            {isEditing ? (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            ) : (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {isEditing ? 'Edit Resource' : 'Add New Resource'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing ? 'Update the details for this campus resource.' : 'Fill in the details to add a new resource.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1">
          <form id="resource-form" onSubmit={handleSubmit}>

            {/* Section: Basic Information */}
            <SectionDivider label="Basic Information" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <InputField
                label="Resource Name"
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                error={errors.name}
              >
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Conference Room A"
                  className={inputClass(errors.name)}
                />
              </InputField>

              <InputField
                label="Resource Type"
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                error={errors.type}
              >
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="e.g. Room, Lab, Projector"
                  className={inputClass(errors.type)}
                />
              </InputField>
            </div>

            {/* Description */}
            <div className="mt-4">
              <InputField
                label="Description"
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8" /></svg>}
              >
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Add any extra details about this resource..."
                  className={`${inputClass(false)} resize-none`}
                />
              </InputField>
            </div>

            {/* Section: Location & Capacity */}
            <div className="mt-6">
              <SectionDivider label="Location & Capacity" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <InputField
                label="Location"
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                error={errors.location}
              >
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Block A, Floor 2"
                  className={inputClass(errors.location)}
                />
              </InputField>

              <InputField
                label="Capacity (persons)"
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                error={errors.capacity}
              >
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  className={inputClass(errors.capacity)}
                />
              </InputField>
            </div>

            {/* Section: Availability & Status */}
            <div className="mt-6">
              <SectionDivider label="Availability & Status" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <InputField
                label="Available From"
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              >
                <input
                  type="time"
                  name="availabilityStart"
                  step="1"
                  value={formData.availabilityStart}
                  onChange={handleChange}
                  className={`${inputClass(false)} [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50`}
                />
              </InputField>

              <InputField
                label="Available Until"
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              >
                <input
                  type="time"
                  name="availabilityEnd"
                  step="1"
                  value={formData.availabilityEnd}
                  onChange={handleChange}
                  className={`${inputClass(false)} [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50`}
                />
              </InputField>
            </div>

            {/* Status Toggle */}
            <div className="mt-4">
              <InputField
                label="Status"
                icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              >
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'ACTIVE' }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      formData.status === 'ACTIVE'
                        ? 'bg-primary-600/20 border-primary-500/50 text-primary-400 ring-1 ring-primary-500/30'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${formData.status === 'ACTIVE' ? 'bg-primary-500' : 'bg-slate-600'}`} />
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: 'OUT_OF_SERVICE' }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      formData.status === 'OUT_OF_SERVICE'
                        ? 'bg-red-600/20 border-red-500/50 text-red-400 ring-1 ring-red-500/30'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${formData.status === 'OUT_OF_SERVICE' ? 'bg-red-500' : 'bg-slate-600'}`} />
                    Out of Service
                  </button>
                </div>
              </InputField>
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl flex items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            {isEditing ? 'Changes will be applied immediately.' : 'All required fields must be filled.'}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="resource-form"
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 active:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg shadow-primary-900/30 transition-all"
            >
              {isEditing ? 'Save Changes' : 'Create Resource'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ResourceModal
