import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ResourceModal from '../components/resources/ResourceModal'
import FacilitiesSidebar from '../components/resources/FacilitiesSidebar'
import StatusBadge from '../components/resources/StatusBadge'
import { getAllResources, createResource, updateResource, deleteResource } from '../api/resourceApi'

// ─── Category config ──────────────────────────────────────────────────────────
const CONFIGS = {
  halls: {
    title: 'Lecture Halls & Rooms',
    subtitle: 'Book conference rooms, lecture halls, and classroom spaces for your events and classes.',
    keywords: ['room', 'hall', 'conference', 'lecture', 'class', 'auditorium', 'theatre', 'seminar'],
    grad: 'from-primary-700 via-primary-800 to-slate-900',
    bar: 'bg-primary-500',
    iconWrap: 'bg-primary-100 text-primary-600',
    badge: 'bg-primary-50 text-primary-700 ring-primary-100',
    btn: 'bg-primary-600 hover:bg-primary-700',
    ring: 'focus:ring-primary-400/30',
    empty: '🏛️',
    Icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  labs: {
    title: 'Laboratories & Studios',
    subtitle: 'Reserve computer labs, science labs, recording studios, and collaborative workshop spaces.',
    keywords: ['lab', 'computer', 'studio', 'library', 'workshop', 'maker', 'science'],
    grad: 'from-primary-700 via-primary-800 to-slate-900',
    bar: 'bg-primary-500',
    iconWrap: 'bg-primary-100 text-primary-600',
    badge: 'bg-primary-50 text-primary-700 ring-primary-100',
    btn: 'bg-primary-600 hover:bg-primary-700',
    ring: 'focus:ring-primary-400/30',
    empty: '💻',
    Icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  equipment: {
    title: 'Equipment & AV Resources',
    subtitle: 'Browse projectors, cameras, audio equipment, and specialist tools available across campus.',
    keywords: ['projector', 'equipment', 'av', 'audio', 'camera', 'video', 'mic', 'screen', 'speaker'],
    grad: 'from-primary-700 via-primary-800 to-slate-900',
    bar: 'bg-primary-500',
    iconWrap: 'bg-primary-100 text-primary-600',
    badge: 'bg-primary-50 text-primary-700 ring-primary-100',
    btn: 'bg-primary-600 hover:bg-primary-700',
    ring: 'focus:ring-primary-400/30',
    empty: '📽️',
    Icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ResourceCategoryPage = ({ category }) => {
  const cfg = CONFIGS[category]
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const forceAdmin = true // 🚨 TEMPORARY UI TESTING OVERRIDE

  const [resources, setResources]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [statusTab, setStatusTab]       = useState('ALL')
  const [search, setSearch]             = useState('')
  const [viewMode, setViewMode]         = useState('grid')
  const [isModalOpen, setIsModalOpen]   = useState(false)
  const [currentResource, setCurrentResource] = useState(null)
  const [confirmId, setConfirmId]       = useState(null)

  const fetchResources = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllResources()
      setResources(data)
    } catch {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchResources() }, [fetchResources])

  // Filter to this category
  const categoryItems = useMemo(() =>
    resources.filter(r => cfg.keywords.some(kw => r.type.toLowerCase().includes(kw))),
    [resources, cfg]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return categoryItems.filter(r => {
      const matchStatus = statusTab === 'ALL' || r.status === statusTab
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)
      return matchStatus && matchSearch
    })
  }, [categoryItems, statusTab, search])

  const stats = useMemo(() => {
    const active = categoryItems.filter(r => r.status === 'ACTIVE').length
    return { total: categoryItems.length, active, oos: categoryItems.length - active }
  }, [categoryItems])

  const formatTime = t => {
    if (!t) return 'N/A'
    const [h, m] = t.split(':')
    const hr = parseInt(h, 10)
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
  }

  const handleDelete = async id => {
    try {
      await deleteResource(id)
      toast.success('Resource deleted')
      setConfirmId(null)
      fetchResources()
    } catch {
      toast.error('Failed to delete resource')
    }
  }

  const handleModalSubmit = async formData => {
    try {
      if (currentResource) {
        await updateResource(currentResource.id, formData)
        toast.success('Resource updated')
      } else {
        await createResource(formData)
        toast.success('Resource added')
      }
      setIsModalOpen(false)
      fetchResources()
    } catch (err) {
      toast.error(err.response?.status === 400 ? 'Check your inputs' : 'Operation failed')
    }
  }

  if (!cfg) return null
  const { Icon } = cfg

  const TABS = [
    { key: 'ALL',            label: 'All',            count: stats.total },
    { key: 'ACTIVE',         label: 'Active',         count: stats.active },
    { key: 'OUT_OF_SERVICE', label: 'Out of Service', count: stats.oos },
  ]

  return (
    <Layout fullWidth noPadding>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-slate-50">

        {/* Sidebar */}
        <div className="w-full lg:w-[260px] shrink-0 bg-white border-r border-slate-200 z-30 shadow-sm relative pt-4">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <FacilitiesSidebar />
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* ── Themed Hero Header ── */}
          <div className={`relative bg-gradient-to-r ${cfg.grad} px-8 py-10 overflow-hidden`}>
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-12 right-40 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-white/60 font-medium mb-5 relative z-10">
              <Link to="/resources" className="hover:text-white transition-colors">Facilities</Link>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              <span className="text-white font-semibold">{cfg.title}</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{cfg.title}</h1>
                  <p className="text-sm text-white/70 max-w-md">{cfg.subtitle}</p>
                </div>
              </div>

              {/* Stat chips */}
              <div className="flex items-center gap-3">
                {[
                  { label: 'Total', val: stats.total, valClass: 'text-white' },
                  { label: 'Active', val: stats.active, valClass: 'text-green-300' },
                  { label: 'OOS', val: stats.oos, valClass: 'text-red-300' },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/15 text-center min-w-[56px]">
                    <p className={`text-xl font-extrabold leading-none ${s.valClass}`}>{s.val}</p>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-5">

            {/* Controls row */}
            <div className="flex flex-wrap items-center justify-between gap-4">

              {/* Status tab bar */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusTab === tab.key
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                      statusTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>{tab.count}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or location…"
                    className={`pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 ${cfg.ring} w-52`}
                  />
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  </button>
                </div>

                {(isAdmin || forceAdmin) && (
                  <button
                    onClick={() => { setCurrentResource(null); setIsModalOpen(true) }}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white ${cfg.btn} rounded-xl transition-all shadow-sm`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Add New
                  </button>
                )}
              </div>
            </div>

            {/* Result count */}
            <p className="text-xs text-slate-400">
              Showing <span className="font-bold text-slate-600">{filtered.length}</span> of <span className="font-bold text-slate-600">{stats.total}</span> resources
            </p>

            {loading ? (
              <div className="py-24 flex justify-center"><LoadingSpinner /></div>

            ) : filtered.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <div className="text-5xl mb-4">{cfg.empty}</div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  {search || statusTab !== 'ALL' ? 'No matching resources' : `No ${cfg.title} yet`}
                </h3>
                <p className="text-sm text-slate-400 mb-5">
                  {search || statusTab !== 'ALL' ? 'Try adjusting your filters.' : 'Add your first resource to this category.'}
                </p>
                {(isAdmin || forceAdmin) && !search && statusTab === 'ALL' && (
                  <button onClick={() => { setCurrentResource(null); setIsModalOpen(true) }} className={`px-5 py-2.5 text-sm font-bold text-white ${cfg.btn} rounded-xl`}>
                    + Add Resource
                  </button>
                )}
              </div>

            ) : viewMode === 'grid' ? (
              /* ── Grid View ── */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(res => (
                  <div key={res.id} className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col group">
                    <div className={`h-1 w-full ${cfg.bar}`} />
                    <div className="p-5 flex flex-col flex-1 relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.iconWrap}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge status={res.status} />
                          {(category === 'halls' || category === 'labs') && (
                            <button 
                              onClick={() => toast.success('Launching 360° AR Tour...')} 
                              className="bg-white/80 backdrop-blur-sm border border-slate-200 text-primary-600 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-primary-50 shadow-sm"
                            >
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-500"></span>
                              </span>
                              360° Walkthrough
                            </button>
                          )}
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">{res.name}</h3>
                      <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md ring-1 mb-2 w-fit ${cfg.badge}`}>{res.type}</span>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-1">{res.description || 'No description.'}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                          <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {res.location}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                          <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Cap. {res.capacity}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400">{formatTime(res.availabilityStart)} – {formatTime(res.availabilityEnd)}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/resources/${res.id}`)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="View detail">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          {(isAdmin || forceAdmin) && (
                            <>
                              <button onClick={() => { setCurrentResource(res); setIsModalOpen(true) }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              {confirmId === res.id ? (
                                <>
                                  <button onClick={() => handleDelete(res.id)} className="px-2 py-1 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg">Yes</button>
                                  <button onClick={() => setConfirmId(null)} className="px-2 py-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">No</button>
                                </>
                              ) : (
                                <button onClick={() => setConfirmId(res.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            ) : (
              /* ── List View ── */
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Cap.</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Hours</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(res => (
                      <tr key={res.id} className="group border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconWrap}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{res.name}</p>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ring-1 ${cfg.badge}`}>{res.type}</span>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-5 py-3.5 text-sm text-slate-500">{res.location}</td>
                        <td className="hidden lg:table-cell px-5 py-3.5 text-sm text-slate-600 font-medium">{res.capacity}</td>
                        <td className="hidden xl:table-cell px-5 py-3.5 text-xs text-slate-400">{formatTime(res.availabilityStart)} – {formatTime(res.availabilityEnd)}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={res.status} /></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => navigate(`/resources/${res.id}`)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            {(isAdmin || forceAdmin) && (
                              <>
                                <button onClick={() => { setCurrentResource(res); setIsModalOpen(true) }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                {confirmId === res.id ? (
                                  <>
                                    <button onClick={() => handleDelete(res.id)} className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-lg">Yes</button>
                                    <button onClick={() => setConfirmId(null)} className="px-2 py-1 text-xs text-slate-600 bg-slate-100 rounded-lg">No</button>
                                  </>
                                ) : (
                                  <button onClick={() => setConfirmId(res.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
                  Showing <strong className="text-slate-700">{filtered.length}</strong> of <strong className="text-slate-700">{stats.total}</strong> resources
                </div>
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

export default ResourceCategoryPage
