import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import Layout from '../components/common/Layout'
import PageTitle from '../components/common/PageTitle'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ResourceModal from '../components/resources/ResourceModal'
import FacilitiesSidebar from '../components/resources/FacilitiesSidebar'
import StatusBadge from '../components/resources/StatusBadge'
import {
  getAllResources, createResource, updateResource, deleteResource
} from '../api/resourceApi'

const getTypeStyle = (type = '') => {
  const t = type.toLowerCase()
  if (t.includes('room') || t.includes('hall') || t.includes('conference') || t.includes('lecture') || t.includes('class'))
    return { accent: 'bg-primary-500', badge: 'bg-primary-50 text-primary-700 ring-primary-100', iconWrap: 'bg-primary-100 text-primary-600' }
  if (t.includes('lab') || t.includes('computer') || t.includes('studio') || t.includes('library'))
    return { accent: 'bg-accent-500', badge: 'bg-accent-50 text-accent-700 ring-accent-100', iconWrap: 'bg-accent-100 text-accent-600' }
  return { accent: 'bg-slate-500', badge: 'bg-slate-50 text-slate-700 ring-slate-100', iconWrap: 'bg-slate-100 text-slate-600' }
}

const TypeIcon = ({ type = '', className = 'w-5 h-5' }) => {
  const t = type.toLowerCase()
  if (t.includes('room') || t.includes('hall') || t.includes('conference') || t.includes('lecture') || t.includes('class'))
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
  if (t.includes('lab') || t.includes('computer') || t.includes('studio') || t.includes('library'))
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  if (t.includes('projector') || t.includes('av') || t.includes('audio') || t.includes('camera'))
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
  if (t.includes('vehicle') || t.includes('bus') || t.includes('van') || t.includes('car'))
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7v8m8-8v8M3 7h18M3 17h18M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
  if (t.includes('sport') || t.includes('gym') || t.includes('field') || t.includes('court'))
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
}

const ResourceCard = ({ resource: res, isAdmin, onEdit, onDelete, onView, formatTime, confirmId, setConfirmId }) => {
  const style = getTypeStyle(res.type)
  const isConfirming = confirmId === res.id

  return (
    <div className="relative bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Top accent line */}
      <div className={`h-1 w-full ${style.accent}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconWrap}`}>
            <TypeIcon type={res.type} />
          </div>
          <StatusBadge status={res.status} />
        </div>

        {/* Title & type */}
        <div className="mb-3">
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-1.5">{res.name}</h3>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ring-1 ${style.badge}`}>
            {res.type}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {res.description || 'No description provided for this resource.'}
        </p>

        {/* Info chips */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {res.location}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Cap. {res.capacity}
          </span>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(res.availabilityStart)} – {formatTime(res.availabilityEnd)}
          </div>

          <div className="flex items-center gap-1">
            {/* View detail — always shown */}
            <button
              onClick={() => onView(res.id)}
              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              title="View details"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            {isAdmin && (isConfirming ? (
              <>
                <span className="text-xs text-red-500 font-medium">Delete?</span>
                <button onClick={() => onDelete(res.id)}
                  className="px-2 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                  Yes
                </button>
                <button onClick={() => setConfirmId(null)}
                  className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  No
                </button>
              </>
            ) : (
              <>
                <button onClick={() => onEdit(res)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button onClick={() => setConfirmId(res.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const ResourceListRow = ({ resource: res, isAdmin, onEdit, onDelete, formatTime, confirmId, setConfirmId }) => {
  const style = getTypeStyle(res.type)
  const isActive = res.status === 'ACTIVE'
  const isConfirming = confirmId === res.id

  return (
    <div className="group flex items-center gap-4 px-5 py-4 bg-white hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconWrap}`}>
        <TypeIcon type={res.type} className="w-4.5 h-4.5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{res.name}</p>
        <p className="text-xs text-slate-400 truncate">{res.description || '—'}</p>
      </div>

      <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ring-1 shrink-0 ${style.badge}`}>
        {res.type}
      </span>

      <span className="hidden md:flex items-center gap-1 text-xs text-slate-500 shrink-0">
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {res.location}
      </span>

      <span className="hidden lg:flex items-center gap-1 text-xs text-slate-500 shrink-0">
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {res.capacity}
      </span>

      <span className="hidden lg:flex items-center gap-1 text-xs text-slate-400 shrink-0">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {formatTime(res.availabilityStart)} – {formatTime(res.availabilityEnd)}
      </span>

      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ring-1 shrink-0 ${isActive ? 'bg-primary-50 text-primary-700 ring-primary-100' : 'bg-red-50 text-red-600 ring-red-100'
        }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary-500' : 'bg-red-500'}`} />
        {isActive ? 'Active' : 'Maint.'}
      </span>

      {isAdmin && (
        <div className="flex items-center gap-1 shrink-0">
          {isConfirming ? (
            <>
              <button onClick={() => onDelete(res.id)}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
                Delete
              </button>
              <button onClick={() => setConfirmId(null)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onEdit(res)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button onClick={() => setConfirmId(res.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

const StatCard = ({ label, value, colorClass, iconBgClass, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}>
      {children}
    </div>
    <div>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
    </div>
  </div>
)

const ResourcesPage = () => {
  useAuth()
  const navigate = useNavigate()
  const forceAdmin = true // 🚨 TEMPORARY UI TESTING OVERRIDE

  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [confirmId, setConfirmId] = useState(null)

  // NEW STATE: For Hero Carousel
  const [currentSlide, setCurrentSlide] = useState(0)

  const [filters, setFilters] = useState({ type: '', location: '', status: '', minCapacity: '' })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentResource, setCurrentResource] = useState(null)

  const fetchResources = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch resources here (example, adjust as needed)
      const data = await getAllResources()
      setResources(data)
    } catch {
      toast.error('Failed to fetch resources')
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto slide effect (5 seconds)
  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchResources()
  }

  const clearSearch = () => {
    const emptyFilters = { type: '', location: '', status: '', minCapacity: '' }
    setFilters(emptyFilters)
    fetchResources()
  }

  const handleAddClick = () => { setCurrentResource(null); setIsModalOpen(true) }
  const handleEditClick = (resource) => { setCurrentResource(resource); setIsModalOpen(true) }
  const handleViewClick = (id) => navigate(`/resources/${id}`)

  const handleDeleteClick = async (id) => {
    try {
      await deleteResource(id)
      toast.success('Resource deleted')
      setConfirmId(null)
      fetchResources()
    } catch {
      toast.error('Failed to delete resource')
    }
  }

  const handleModalSubmit = async (formData) => {
    try {
      if (currentResource) {
        await updateResource(currentResource.id, formData)
        toast.success('Resource updated successfully')
      } else {
        await createResource(formData)
        toast.success('Resource created successfully')
      }
      setIsModalOpen(false)
      fetchResources()
    } catch (err) {
      toast.error(err.response?.status === 400 ? 'Please check your input values' : 'Operation failed')
    }
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A'
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours, 10)
    return `${h % 12 || 12}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`
  }

  const stats = useMemo(() => {
    const active = resources.filter(r => r.status === 'ACTIVE').length
    return {
      total: resources.length,
      active,
      maintenance: resources.length - active,
      locations: new Set(resources.map(r => r.location)).size
    }
  }, [resources])

  const hasActiveFilters = Object.values(filters).some(v => v !== '')

  // Carousel Handlers
  const nextSlide = () => setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1))
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1))

  return (
    <Layout fullWidth noPadding>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-slate-50">

        {/* Sidebar - Flush Left and starts exactly at top edge */}
        <div className="w-full lg:w-[260px] shrink-0 bg-white border-r border-slate-200 z-30 shadow-sm relative pt-4">
          <div className="sticky top-0 h-[calc(100vh-64px)] overflow-y-auto">
            <FacilitiesSidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col relative">

          {/* Banner - Full Width. Added negative margin top to ensure it touches navbar if needed */}
          <div className="relative w-full h-[340px] overflow-hidden shadow-md group bg-slate-900 border-b border-slate-200/60">

            {/* Inner Sliding Track */}
            <div
              className="flex w-full h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >

              {/* SLIDE 1: The "Resource Hub" Transparent Primary-Themed Screen */}
              <div className="min-w-full h-full relative bg-transparent bg-gradient-to-r from-primary-900/90 via-slate-900/90 to-primary-900/80 flex flex-col items-center justify-center text-center px-4">
                {/* Tiny top badge */}
                <div className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-xs text-white font-medium">{resources.length} resources available</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
                  Facility <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-200">Hub</span>
                </h1>

                <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-8">
                  Discover lecture halls, computer labs, event spaces and specialized equipment — curated for students and managed by campus admins.
                </p>

                <div className="flex flex-wrap justify-center gap-3">
                  <button onClick={() => navigate('/resources/halls')} className="px-5 py-2 rounded-full bg-white/10 hover:bg-blue-500/30 border border-white/10 hover:border-blue-400/50 text-white text-sm font-medium transition-all flex items-center gap-2">
                    <span>🏛️</span> Halls
                  </button>
                  <button onClick={() => navigate('/resources/labs')} className="px-5 py-2 rounded-full bg-white/10 hover:bg-violet-500/30 border border-white/10 hover:border-violet-400/50 text-white text-sm font-medium transition-all flex items-center gap-2">
                    <span>💻</span> Labs
                  </button>
                  <button onClick={() => navigate('/resources/equipment')} className="px-5 py-2 rounded-full bg-white/10 hover:bg-amber-500/30 border border-white/10 hover:border-amber-400/50 text-white text-sm font-medium transition-all flex items-center gap-2">
                    <span>📽️</span> Equipment
                  </button>
                  {forceAdmin && (
                    <button onClick={handleAddClick} className="px-5 py-2 rounded-full bg-primary-500 hover:bg-primary-400 text-white text-sm font-bold transition-colors shadow-lg shadow-primary-500/30">
                      + Add Resource
                    </button>
                  )}
                </div>
              </div>

              {/* SLIDE 2: Library Image */}
              <div className="min-w-full h-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent z-10"></div>
                <img src="/high-angle-students-learning-library.jpg" alt="Library" className="absolute inset-0 w-full h-full object-cover object-center" />
                <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 md:px-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-md">Collaborative Spaces</h2>
                  <p className="text-slate-200 text-sm md:text-base max-w-lg leading-relaxed drop-shadow-md">
                    Book quiet study areas, modern library rooms, and collaborative hubs perfect for group assignments and deep research.
                  </p>
                </div>
              </div>

              {/* SLIDE 3: Amphitheater Image */}
              <div className="min-w-full h-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent z-10"></div>
                <img src="/modern-amphitheater-usa.jpg" alt="Amphitheater" className="absolute inset-0 w-full h-full object-cover object-bottom" />
                <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 md:px-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-md">Event Venues</h2>
                  <p className="text-slate-200 text-sm md:text-base max-w-lg leading-relaxed drop-shadow-md">
                    Reserve massive outdoor amphitheaters, open-air stages, and main halls for university-wide events and student gatherings.
                  </p>
                </div>
              </div>

            </div>

            {/* Left/Right Navigation Arrows (Skill Nest Style) */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg className="w-5 h-5 pr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg className="w-5 h-5 pl-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            {/* Bottom Dot Indicators */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>

          {/* Content Area with Padding (Below Banner) */}
          <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-6 flex-1 max-w-[1400px] mx-auto w-full">

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Assets" value={stats.total} colorClass="text-slate-800" iconBgClass="bg-slate-100">
                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </StatCard>
              <StatCard label="Active Resources" value={stats.active} colorClass="text-primary-700" iconBgClass="bg-primary-50">
                <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </StatCard>
              <StatCard label="In Maintenance" value={stats.maintenance} colorClass="text-red-700" iconBgClass="bg-red-50">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </StatCard>
              <StatCard label="Campus Locations" value={stats.locations} colorClass="text-amber-700" iconBgClass="bg-amber-50">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </StatCard>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <form onSubmit={handleSearch}>
                <div className="flex flex-wrap items-stretch divide-x divide-slate-100">
                  {/* Search by type */}
                  <div className="flex-1 min-w-[160px] relative flex items-center">
                    <svg className="w-4 h-4 absolute left-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      name="type"
                      value={filters.type}
                      onChange={handleFilterChange}
                      placeholder="Search by type or keyword..."
                      className="w-full pl-10 pr-4 py-3.5 text-sm text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Location */}
                  <div className="relative flex items-center">
                    <svg className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      name="location"
                      value={filters.location}
                      onChange={handleFilterChange}
                      placeholder="Location"
                      className="w-32 pl-9 pr-3 py-3.5 text-sm text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Status */}
                  <div className="relative flex items-center">
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-36 px-4 py-3.5 text-sm text-slate-700 bg-transparent focus:outline-none cursor-pointer appearance-none"
                    >
                      <option value="">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="OUT_OF_SERVICE">Maintenance</option>
                    </select>
                    <svg className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Min Capacity */}
                  <div className="relative flex items-center">
                    <svg className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="number"
                      name="minCapacity"
                      value={filters.minCapacity}
                      onChange={handleFilterChange}
                      placeholder="Min cap."
                      min="1"
                      className="w-28 pl-9 pr-3 py-3.5 text-sm text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 px-4 py-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      Search
                    </button>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="Clear filters"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Results bar + View Toggle */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-800">{resources.length}</span>{' '}
                resource{resources.length !== 1 ? 's' : ''}
                {hasActiveFilters && (
                  <span className="ml-2 inline-flex items-center gap-1 text-primary-600 font-medium text-xs bg-primary-50 px-2 py-0.5 rounded-full">
                    Filtered
                  </span>
                )}
              </p>
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="List view"
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="py-24 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : resources.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No resources found</h3>
                <p className="text-sm text-slate-400 mb-5">
                  {hasActiveFilters ? 'Try adjusting your filters or search terms.' : 'Get started by adding your first campus resource.'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  {hasActiveFilters && (
                    <button onClick={clearSearch}
                      className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                      Clear Filters
                    </button>
                  )}
                  {forceAdmin && (
                    <button onClick={handleAddClick}
                      className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors">
                      Add Resource
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {resources.map(res => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    isAdmin={forceAdmin}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onView={handleViewClick}
                    formatTime={formatTime}
                    confirmId={confirmId}
                    setConfirmId={setConfirmId}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* List header */}
                <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
                  <div className="w-9 shrink-0" />
                  <span className="flex-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</span>
                  <span className="hidden sm:block w-28 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</span>
                  <span className="hidden md:block w-28 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</span>
                  <span className="hidden lg:block w-16 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cap.</span>
                  <span className="hidden lg:block w-36 text-xs font-semibold text-slate-500 uppercase tracking-wider">Availability</span>
                  <span className="w-20 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                  {forceAdmin && <span className="w-16" />}
                </div>
                {resources.map(res => (
                  <ResourceListRow
                    key={res.id}
                    resource={res}
                    isAdmin={forceAdmin}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    formatTime={formatTime}
                    confirmId={confirmId}
                    setConfirmId={setConfirmId}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isEditing={!!currentResource}
        resource={currentResource}
      />
    </Layout>
  )
}

export default ResourcesPage