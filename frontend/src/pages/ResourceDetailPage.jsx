import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ResourceModal from '../components/resources/ResourceModal'
import FacilitiesSidebar from '../components/resources/FacilitiesSidebar'
import StatusBadge from '../components/resources/StatusBadge'
import { getResourceById, updateResource, deleteResource } from '../api/resourceApi'

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const getTypeStyle = (type = '') => {
  const t = type.toLowerCase()
  if (t.includes('room') || t.includes('hall') || t.includes('conference') || t.includes('lecture') || t.includes('class'))
    return {
      heroFrom: 'from-primary-900', heroVia: 'via-primary-800', heroTo: 'to-slate-900',
      glowColor: 'bg-primary-500', iconWrap: 'bg-primary-500/20 text-primary-300 ring-primary-500/30',
      badge: 'bg-primary-500/20 text-primary-300 ring-primary-500/30',
      accentBar: 'from-primary-400 to-primary-600',
      chipBg: 'bg-primary-50 text-primary-700',
    }
  if (t.includes('lab') || t.includes('computer') || t.includes('studio') || t.includes('library'))
    return {
      heroFrom: 'from-amber-900', heroVia: 'via-slate-900', heroTo: 'to-slate-900',
      glowColor: 'bg-amber-500', iconWrap: 'bg-amber-500/20 text-amber-300 ring-amber-500/30',
      badge: 'bg-amber-500/20 text-amber-300 ring-amber-500/30',
      accentBar: 'from-amber-400 to-amber-600',
      chipBg: 'bg-amber-50 text-amber-700',
    }
  return {
    heroFrom: 'from-slate-800', heroVia: 'via-slate-900', heroTo: 'to-slate-900',
    glowColor: 'bg-slate-500', iconWrap: 'bg-slate-500/20 text-slate-300 ring-slate-500/30',
    badge: 'bg-slate-500/20 text-slate-300 ring-slate-500/30',
    accentBar: 'from-slate-400 to-slate-600',
    chipBg: 'bg-slate-100 text-slate-700',
  }
}

const TypeIcon = ({ type = '', className = 'w-8 h-8' }) => {
  const t = type.toLowerCase()
  if (t.includes('room') || t.includes('hall') || t.includes('conference') || t.includes('lecture') || t.includes('class'))
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
  if (t.includes('lab') || t.includes('computer') || t.includes('studio') || t.includes('library'))
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  if (t.includes('projector') || t.includes('av') || t.includes('audio') || t.includes('camera'))
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
  if (t.includes('vehicle') || t.includes('bus') || t.includes('van') || t.includes('car'))
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8m8-8v8M3 7h18M3 17h18M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const ResourceDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const forceAdmin = true // 🚨 TEMPORARY UI TESTING OVERRIDE

  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true)
      try {
        const data = await getResourceById(id)
        setResource(data)
      } catch {
        toast.error('Resource not found')
        navigate('/resources')
      } finally {
        setLoading(false)
      }
    }
    fetchResource()
  }, [id, navigate])

  const handleModalSubmit = async (formData) => {
    try {
      const updated = await updateResource(id, formData)
      setResource(updated)
      toast.success('Resource updated successfully')
      setIsModalOpen(false)
    } catch (err) {
      toast.error(err.response?.status === 400 ? 'Please check your input values' : 'Failed to update resource')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteResource(id)
      toast.success('Resource deleted')
      navigate('/resources')
    } catch {
      toast.error('Failed to delete resource')
      setDeleting(false)
    }
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A'
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours, 10)
    return `${h % 12 || 12}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`
  }

  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A'
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const totalMins = (eh * 60 + em) - (sh * 60 + sm)
    if (totalMins <= 0) return 'N/A'
    const hrs = Math.floor(totalMins / 60)
    const mins = totalMins % 60
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`
  }

  return (
    <Layout fullWidth noPadding>
      {/* ── Page Shell ── */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-slate-50">

        {/* Sidebar */}
        <div className="w-full lg:w-[260px] shrink-0 bg-white border-r border-slate-200 z-30 shadow-sm relative pt-4">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <FacilitiesSidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col">

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-32">
              <LoadingSpinner />
            </div>
          ) : !resource ? null : (() => {
            const style = getTypeStyle(resource.type)
            const isActive = resource.status === 'ACTIVE'
            const isHallOrLab = resource.type.toLowerCase().includes('hall') || resource.type.toLowerCase().includes('lab') || resource.type.toLowerCase().includes('room')

            return (
              <div className="flex flex-col flex-1">

                {/* ══════════════════════════════════════
                    HERO BANNER — Full-width dark gradient
                ══════════════════════════════════════ */}
                <div className={`relative bg-gradient-to-br ${style.heroFrom} ${style.heroVia} ${style.heroTo} overflow-hidden`}>
                  {/* Decorative glows */}
                  <div className={`absolute -top-20 -right-20 w-72 h-72 ${style.glowColor} rounded-full filter blur-[100px] opacity-20 pointer-events-none`} />
                  <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-white rounded-full filter blur-[80px] opacity-5 pointer-events-none" />

                  {/* Grid pattern overlay */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 50%),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 50%)', backgroundSize: '40px 40px' }} />

                  <div className="relative z-10 px-8 sm:px-10 lg:px-12 pt-8 pb-10">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1.5 text-xs text-white/40 font-medium mb-8">
                      <Link to="/dashboard" className="hover:text-white/70 transition-colors">Smart Campus</Link>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                      <Link to="/resources" className="hover:text-white/70 transition-colors">Facilities</Link>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                      <span className="text-white/70 font-semibold truncate max-w-[200px]">{resource.name}</span>
                    </nav>

                    {/* Hero Content Row */}
                    <div className="flex flex-col lg:flex-row lg:items-end gap-8">

                      {/* Left: Icon + Title + Meta */}
                      <div className="flex-1 min-w-0">
                        {/* Type icon */}
                        <div className={`w-16 h-16 rounded-2xl ring-1 flex items-center justify-center mb-5 ${style.iconWrap}`}>
                          <TypeIcon type={resource.type} className="w-8 h-8" />
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ring-1 ${style.badge}`}>
                            {resource.type}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ring-1 ${isActive
                              ? 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 ring-red-500/30'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            {isActive ? 'Active' : 'Out of Service'}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 bg-white/10 px-3 py-1 rounded-full">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {resource.location}
                          </span>
                        </div>

                        {/* Resource name */}
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 leading-tight">
                          {resource.name}
                        </h1>

                        {/* Description */}
                        <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
                          {resource.description || 'No description has been provided for this resource.'}
                        </p>
                      </div>

                      {/* Right: Stats chips */}
                      <div className="flex flex-wrap lg:flex-col gap-3 lg:items-end shrink-0">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 text-center min-w-[90px]">
                          <p className="text-2xl font-black text-white">{resource.capacity}</p>
                          <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mt-0.5">Capacity</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 text-center min-w-[90px]">
                          <p className="text-2xl font-black text-white">{formatDuration(resource.availabilityStart, resource.availabilityEnd)}</p>
                          <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mt-0.5">Daily Hrs</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 text-center min-w-[90px]">
                          <p className="text-lg font-black text-white font-mono">#{resource.id}</p>
                          <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mt-0.5">Asset ID</p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons row — below title */}
                    <div className="mt-8 flex flex-wrap items-center gap-2.5">
                      {/* Primary: Book Now */}
                      {isActive && (
                        <button
                          onClick={() => navigate('/bookings', { state: { initialResource: resource } })}
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 hover:bg-primary-400 active:scale-[0.98] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary-900/40"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Book Now
                        </button>
                      )}

                      {/* 360° Walkthrough */}
                      {isHallOrLab && (
                        <button
                          onClick={() => toast.success('Launching 360° AR Tour...')}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold rounded-xl transition-all backdrop-blur-sm"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                          </span>
                          360° Walkthrough
                        </button>
                      )}

                      {/* Asset Tag */}
                      <button
                        onClick={() => setQrModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold rounded-xl transition-all backdrop-blur-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        Asset Tag
                      </button>

                      {/* Admin: Edit + Delete */}
                      {(isAdmin || forceAdmin) && (
                        <>
                          <div className="w-px h-6 bg-white/20" />
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold rounded-xl transition-all backdrop-blur-sm"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                          </button>

                          {showDeleteConfirm ? (
                            <div className="flex items-center gap-2 bg-red-900/50 border border-red-500/40 rounded-xl px-3 py-2">
                              <span className="text-xs font-semibold text-red-300">Confirm delete?</span>
                              <button onClick={handleDelete} disabled={deleting}
                                className="px-3 py-1 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50">
                                {deleting ? 'Deleting…' : 'Yes'}
                              </button>
                              <button onClick={() => setShowDeleteConfirm(false)}
                                className="px-3 py-1 text-xs font-semibold text-white/70 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-sm font-semibold rounded-xl transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Accent bottom bar */}
                  <div className={`h-1 w-full bg-gradient-to-r ${style.accentBar}`} />
                </div>

                {/* ══════════════════════════════════════
                    DETAIL BODY
                ══════════════════════════════════════ */}
                <div className="flex-1 px-6 sm:px-8 lg:px-10 py-8 max-w-[1400px] w-full mx-auto space-y-6">

                  {/* ── Quick-stat chips row ── */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: 'Opens',
                        value: formatTime(resource.availabilityStart),
                        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                        color: 'text-primary-600', bg: 'bg-primary-50',
                      },
                      {
                        label: 'Closes',
                        value: formatTime(resource.availabilityEnd),
                        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                        color: 'text-rose-600', bg: 'bg-rose-50',
                      },
                      {
                        label: 'Capacity',
                        value: `${resource.capacity} pax`,
                        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
                        color: 'text-violet-600', bg: 'bg-violet-50',
                      },
                      {
                        label: 'Total Hours',
                        value: formatDuration(resource.availabilityStart, resource.availabilityEnd),
                        icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
                        color: 'text-amber-600', bg: 'bg-amber-50',
                      },
                    ].map(chip => (
                      <div key={chip.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${chip.bg} ${chip.color}`}>
                          {chip.icon}
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-semibold">{chip.label}</p>
                          <p className={`text-base font-extrabold ${chip.color}`}>{chip.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ── Main detail grid ── */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                    {/* ── Resource Details Card (left 2/3) ── */}
                    <div className="xl:col-span-2 space-y-5">

                      {/* Info card */}
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <h2 className="text-sm font-bold text-slate-700">Resource Details</h2>
                        </div>

                        <div className="divide-y divide-slate-50">
                          {[
                            { label: 'Resource Name', value: resource.name, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> },
                            { label: 'Type', value: resource.type, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
                            { label: 'Location', value: resource.location, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
                            { label: 'Capacity', value: `${resource.capacity} person${resource.capacity !== 1 ? 's' : ''}`, icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
                          ].map(row => (
                            <div key={row.label} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 transition-colors">
                                {row.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.label}</p>
                                <p className="text-sm font-semibold text-slate-800 truncate">{row.value}</p>
                              </div>
                            </div>
                          ))}

                          {/* Status row */}
                          <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                              <StatusBadge status={resource.status} size="lg" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Live IoT Telemetry */}
                      {isHallOrLab && (
                        <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden relative group">
                          {/* Animated glow blobs */}
                          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500 rounded-full mix-blend-screen filter blur-[60px] opacity-15 group-hover:opacity-25 transition-opacity" />
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-500 rounded-full mix-blend-screen filter blur-[50px] opacity-10 group-hover:opacity-20 transition-opacity" />

                          <div className="relative z-10 p-6">
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                                </span>
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live IoT Telemetry</p>
                              </div>
                              <span className="text-[9px] text-slate-500 font-medium bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">Syncing…</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-3">
                              {[
                                { label: 'Temperature', value: '22', unit: '°C', color: 'text-orange-400' },
                                { label: 'Humidity', value: '58', unit: '%', color: 'text-sky-400' },
                                { label: 'Air Quality', value: '42', unit: 'AQI', color: 'text-emerald-400' },
                              ].map(sensor => (
                                <div key={sensor.label} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5">
                                  <p className="text-slate-400 text-[10px] font-semibold mb-1">{sensor.label}</p>
                                  <div className="flex items-end gap-1">
                                    <p className={`text-2xl font-black ${sensor.color}`}>{sensor.value}</p>
                                    <p className={`text-xs mb-0.5 font-bold ${sensor.color} opacity-70`}>{sensor.unit}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Occupancy bar */}
                            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
                              <span className="text-xs text-slate-400 font-semibold shrink-0">Occupancy</span>
                              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-primary-500 rounded-full" style={{ width: '23%' }} />
                              </div>
                              <span className="text-white text-xs font-black shrink-0">23%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Right column: Availability + Info ── */}
                    <div className="space-y-5">

                      {/* Availability card */}
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h2 className="text-sm font-bold text-slate-700">Availability</h2>
                        </div>

                        <div className="p-5">
                          {/* Visual time block */}
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Opens</p>
                                <p className="text-2xl font-extrabold text-slate-900">{formatTime(resource.availabilityStart)}</p>
                              </div>
                              <div className="flex-1 flex flex-col items-center gap-1 px-3">
                                <div className="w-full h-px bg-slate-300 relative">
                                  <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Closes</p>
                                <p className="text-2xl font-extrabold text-slate-900">{formatTime(resource.availabilityEnd)}</p>
                              </div>
                            </div>
                            <div className="text-center">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 bg-primary-50 border border-primary-100 px-3 py-1 rounded-full">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                {formatDuration(resource.availabilityStart, resource.availabilityEnd)} available
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            {[
                              { label: 'Opening time', value: formatTime(resource.availabilityStart) },
                              { label: 'Closing time', value: formatTime(resource.availabilityEnd) },
                              { label: 'Duration', value: formatDuration(resource.availabilityStart, resource.availabilityEnd), highlight: true },
                            ].map(item => (
                              <div key={item.label} className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">{item.label}</span>
                                <span className={`font-semibold ${item.highlight ? 'text-primary-600 font-bold' : 'text-slate-800'}`}>{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Resource info card */}
                      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Resource Info</p>
                        <div className="space-y-3">
                          {[
                            { label: 'Resource ID', value: `#${resource.id}`, mono: true },
                            { label: 'Capacity', value: `${resource.capacity} pax` },
                            { label: 'Status', badge: true },
                          ].map(item => (
                            <div key={item.label} className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">{item.label}</span>
                              {item.badge
                                ? <StatusBadge status={resource.status} size="sm" />
                                : <span className={`font-semibold text-slate-800 ${item.mono ? 'font-mono bg-slate-100 px-2 py-0.5 rounded-lg text-xs' : ''}`}>{item.value}</span>
                              }
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Book Now CTA Banner ── */}
                  {isActive && (
                    <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-6 shadow-xl shadow-primary-900/20">
                      {/* Decorative blob */}
                      <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                      <div className="absolute right-16 bottom-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

                      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-lg mb-0.5">Ready to reserve {resource.name}?</p>
                          <p className="text-primary-200 text-sm">
                            Available {formatTime(resource.availabilityStart)} – {formatTime(resource.availabilityEnd)} &middot; {resource.capacity} seat{resource.capacity !== 1 ? 's' : ''} &middot; {resource.location}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate('/bookings', { state: { initialResource: resource } })}
                          className="flex items-center gap-2.5 px-7 py-3.5 bg-white hover:bg-primary-50 active:scale-[0.98] text-primary-700 font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary-900/20 shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Book Now
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Footer nav ── */}
                  <div className="flex items-center justify-between pb-4">
                    <Link to="/resources"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors group">
                      <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Asset Catalogue
                    </Link>
                    {(isAdmin || forceAdmin) && (
                      <button onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit Resource
                      </button>
                    )}
                  </div>

                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isEditing={true}
        resource={resource}
      />

      {/* ── QR Asset Tag Modal ── */}
      {qrModalOpen && resource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setQrModalOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden flex flex-col items-center text-center" onClick={e => e.stopPropagation()}>
            <div className="w-full bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-6">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">{resource.name}</h2>
              <p className="text-primary-200 text-[11px] font-semibold uppercase tracking-widest mt-1">Smart Asset Tag</p>
            </div>

            <div className="px-8 pt-7 pb-5 flex flex-col items-center">
              <div className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner bg-white flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=176x176&data=${encodeURIComponent(`SMARTCAMPUS|RESOURCE|${resource.id}|${resource.name}|${resource.location}`)}&color=059669&bgcolor=FFFFFF&qzone=1&format=png`}
                  alt="QR Code"
                  className="w-44 h-44 object-contain"
                  onError={(e) => { e.target.src = `https://chart.googleapis.com/chart?chs=176x176&cht=qr&chl=${encodeURIComponent(resource.id)}&choe=UTF-8` }}
                />
              </div>
              <p className="text-sm font-semibold text-slate-700 mt-4 mb-0.5">{resource.location}</p>
              <p className="text-xs text-slate-400 font-mono">ID: #{resource.id}</p>
            </div>

            <div className="w-full px-5 pb-5 flex gap-2">
              <button className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700 rounded-xl transition-colors" onClick={() => setQrModalOpen(false)}>
                Close
              </button>
              <button
                className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                onClick={() => {
                  const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`SMARTCAMPUS|RESOURCE|${resource.id}|${resource.name}|${resource.location}`)}&color=059669&bgcolor=FFFFFF&qzone=2&format=png`
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `asset-tag-${resource.id}.png`
                  a.target = '_blank'
                  a.click()
                  toast.success('Downloading Asset Tag…')
                  setQrModalOpen(false)
                }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default ResourceDetailPage