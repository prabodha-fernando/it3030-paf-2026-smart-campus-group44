import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import Layout from '../components/common/Layout'
import FacilitiesSidebar from '../components/resources/FacilitiesSidebar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ResourceModal from '../components/resources/ResourceModal'
import { getAllResources, createResource, updateResource, deleteResource } from '../api/resourceApi'

// ─── Group resources by location ──────────────────────────────────────────────
const groupByLocation = resources => {
  const map = {}
  resources.forEach(r => {
    if (!map[r.location]) map[r.location] = { name: r.location, resources: [], total: 0, active: 0 }
    map[r.location].resources.push(r)
    map[r.location].total++
    if (r.status === 'ACTIVE') map[r.location].active++
  })
  return Object.values(map).sort((a, b) => a.name.localeCompare(b.name))
}

const buildingStatus = (total, active) =>
  active === total ? 'full' : active === 0 ? 'none' : 'partial'

const RING_CLASS = { full: 'ring-green-400/40 bg-green-50', partial: 'ring-amber-400/40 bg-amber-50', none: 'ring-red-400/40 bg-red-50' }
const DOT_CLASS  = { full: 'bg-green-500', partial: 'bg-amber-500', none: 'bg-red-500' }
const BAR_CLASS  = { full: 'bg-green-500', partial: 'bg-amber-500', none: 'bg-red-500' }
const ICON_CLASS = { full: 'text-green-600', partial: 'text-amber-600', none: 'text-red-600' }
const LABEL      = { full: 'All Active', partial: 'Partially Available', none: 'All Unavailable' }

// ─── Main Page ─────────────────────────────────────────────────────────────────
const CampusMapPage = () => {
  const navigate   = useNavigate()
  const { isAdmin } = useAuth()
  const forceAdmin  = true // 🚨 TEMPORARY UI TESTING OVERRIDE

  const [resources, setResources]           = useState([])
  const [loading, setLoading]               = useState(true)
  const [search, setSearch]                 = useState('')
  const [expandedBuilding, setExpanded]     = useState(null)
  const [isModalOpen, setIsModalOpen]       = useState(false)
  const [currentResource, setCurrentResource] = useState(null)
  const [confirmId, setConfirmId]           = useState(null)
  const [statusFilter, setStatusFilter]     = useState('ALL')

  const fetchResources = useCallback(async () => {
    setLoading(true)
    try { setResources(await getAllResources()) }
    catch { toast.error('Failed to load resources') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchResources() }, [fetchResources])

  const buildings = useMemo(() => groupByLocation(resources), [resources])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return buildings
      .filter(b => {
        const matchSearch = !q || b.name.toLowerCase().includes(q) || b.resources.some(r => r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q))
        const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && b.active > 0) || (statusFilter === 'ISSUES' && b.active < b.total)
        return matchSearch && matchStatus
      })
  }, [buildings, search, statusFilter])

  const totalStats = useMemo(() => ({
    locations: buildings.length,
    total: resources.length,
    active: resources.filter(r => r.status === 'ACTIVE').length,
    oos: resources.filter(r => r.status !== 'ACTIVE').length,
  }), [buildings, resources])

  const handleDelete = async id => {
    try { await deleteResource(id); toast.success('Resource deleted'); setConfirmId(null); fetchResources() }
    catch { toast.error('Failed to delete') }
  }
  const handleModalSubmit = async fd => {
    try {
      if (currentResource) { await updateResource(currentResource.id, fd); toast.success('Updated') }
      else { await createResource(fd); toast.success('Resource added') }
      setIsModalOpen(false); fetchResources()
    } catch { toast.error('Operation failed') }
  }

  return (
    <Layout>
      <div className="w-[100vw] relative left-1/2 -ml-[50vw] min-h-[calc(100vh-64px)] -mt-8 bg-slate-50 flex flex-col lg:flex-row overflow-x-hidden">

        {/* Sidebar */}
        <div className="w-full lg:w-[260px] shrink-0 bg-white border-r border-slate-200 z-30 shadow-sm relative pt-4">
          <div className="sticky top-0 h-screen overflow-y-auto"><FacilitiesSidebar /></div>
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* ── Teal Hero Header ── */}
          <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-slate-900 px-8 py-10 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary-400/10 pointer-events-none" />
            <div className="absolute -bottom-12 left-1/4 w-52 h-52 rounded-full bg-primary-500/10 translate-y-1/2 pointer-events-none" />

            <nav className="relative z-10 flex items-center gap-1.5 text-xs text-white/50 font-medium mb-5">
              <Link to="/resources" className="hover:text-white transition-colors">Facilities</Link>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              <span className="text-white/80">Campus Map</span>
            </nav>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white border border-white/20">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Campus Map</h1>
                  <p className="text-sm text-white/70">{totalStats.locations} building{totalStats.locations !== 1 ? 's' : ''} across campus</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {[
                  { label: 'Buildings', val: totalStats.locations, cls: 'text-white' },
                  { label: 'Active', val: totalStats.active, cls: 'text-green-300' },
                  { label: 'Issues', val: totalStats.oos, cls: 'text-red-300' },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 rounded-xl px-4 py-2.5 border border-white/15 text-center min-w-[56px]">
                    <p className={`text-xl font-extrabold leading-none ${s.cls}`}>{s.val}</p>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-5">

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buildings or resources…" className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 w-64" />
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  {[{ k: 'ALL', l: 'All' }, { k: 'ACTIVE', l: 'Active Only' }, { k: 'ISSUES', l: 'Has Issues' }].map(f => (
                    <button key={f.k} onClick={() => setStatusFilter(f.k)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === f.k ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>{f.l}</button>
                  ))}
                </div>

                {/* Legend */}
                <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400">
                  {[['bg-green-500', 'All Active'], ['bg-amber-500', 'Partial'], ['bg-red-500', 'OOS']].map(([dot, label]) => (
                    <span key={label} className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${dot}`} />{label}</span>
                  ))}
                </div>
              </div>

              {(isAdmin || forceAdmin) && (
                <button onClick={() => { setCurrentResource(null); setIsModalOpen(true) }} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  Add Resource
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-24 flex justify-center"><LoadingSpinner /></div>

            ) : filtered.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </div>
                <p className="text-sm font-bold text-slate-700 mb-1">No buildings found</p>
                <p className="text-xs text-slate-400">{search ? 'Try a different search.' : 'Add resources first.'}</p>
              </div>

            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(building => {
                  const st  = buildingStatus(building.total, building.active)
                  const exp = expandedBuilding === building.name
                  return (
                    <div key={building.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

                      {/* Building header — clickable */}
                      <button onClick={() => setExpanded(exp ? null : building.name)} className="w-full p-5 flex items-start gap-4 text-left">
                        <div className={`w-12 h-12 rounded-xl ring-2 flex items-center justify-center shrink-0 ${RING_CLASS[st]}`}>
                          <svg className={`w-6 h-6 ${ICON_CLASS[st]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-slate-900 truncate">{building.name}</h3>
                            <span className={`w-2 h-2 rounded-full shrink-0 ${DOT_CLASS[st]}`} />
                          </div>
                          <p className="text-xs text-slate-500 mb-2">{LABEL[st]}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">{building.total} resource{building.total !== 1 ? 's' : ''}</span>
                            <span className="text-xs font-semibold text-green-600">{building.active} active</span>
                            {building.total - building.active > 0 && <span className="text-xs font-semibold text-red-500">{building.total - building.active} OOS</span>}
                          </div>
                        </div>
                        <svg className={`w-4 h-4 text-slate-400 shrink-0 mt-1 transition-transform ${exp ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>

                      {/* Progress bar */}
                      <div className="px-5 pb-4">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${BAR_CLASS[st]}`} style={{ width: `${(building.active / building.total) * 100}%` }} />
                        </div>
                      </div>

                      {/* Expanded resource list */}
                      {exp && (
                        <div className="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/50">
                          {building.resources.map(res => (
                            <div key={res.id} className="group flex items-center justify-between px-5 py-4 hover:bg-white transition-colors">
                              <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${res.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 truncate">{res.name}</p>
                                  <p className="text-[10px] text-slate-400">{res.type}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                {/* Capacity Heatmap visualization */}
                                <div className="flex flex-col items-end gap-1">
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <div key={i} className={`w-1 h-3 rounded-full ${i < Math.min(5, Math.ceil(res.capacity / 50)) ? 'bg-accent-500' : 'bg-slate-200'}`} />
                                    ))}
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-400">CAP: {res.capacity}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => navigate(`/resources/${res.id}`)} className="p-1 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </button>
                                {(isAdmin || forceAdmin) && (
                                  <>
                                    <button onClick={() => { setCurrentResource(res); setIsModalOpen(true) }} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    {confirmId === res.id ? (
                                      <>
                                        <button onClick={() => handleDelete(res.id)} className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded">Yes</button>
                                        <button onClick={() => setConfirmId(null)} className="px-1.5 py-0.5 text-[10px] text-slate-600 bg-slate-200 rounded">No</button>
                                      </>
                                    ) : (
                                      <button onClick={() => setConfirmId(res.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      )}
                    </div>
                  )
                })}
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

export default CampusMapPage
