import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import Layout from '../components/common/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ResourceModal from '../components/resources/ResourceModal'
import FacilitiesSidebar from '../components/resources/FacilitiesSidebar'
import StatusBadge from '../components/resources/StatusBadge'
import {
  getAllResources, createResource, updateResource, deleteResource
} from '../api/resourceApi'

// ─── Type colour helper ───────────────────────────────────────────────────────
const getTypeStyle = (type = '') => {
  const t = type.toLowerCase()
  if (t.includes('room') || t.includes('hall') || t.includes('conference') || t.includes('lecture') || t.includes('class'))
    return { badge: 'bg-primary-50 text-primary-700 ring-primary-100', dot: 'bg-primary-500' }
  if (t.includes('lab') || t.includes('computer') || t.includes('studio') || t.includes('library'))
    return { badge: 'bg-accent-50 text-accent-700 ring-accent-100', dot: 'bg-accent-500' }
  return { badge: 'bg-slate-50 text-slate-700 ring-slate-100', dot: 'bg-slate-500' }
}

// ─── Mini chart bar ───────────────────────────────────────────────────────────
const MiniBar = ({ value, max, color }) => (
  <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-700 ${color}`}
      style={{ width: `${Math.min(100, (value / (max || 1)) * 100)}%` }}
    />
  </div>
)

// ─── KPI card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, icon, accent }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
)

// ─── Type breakdown row ───────────────────────────────────────────────────────
const BreakdownRow = ({ label, count, total, color }) => (
  <div className="flex items-center gap-3">
    <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
    <span className="text-xs text-slate-600 flex-1 truncate">{label}</span>
    <span className="text-xs font-bold text-slate-800 w-5 text-right">{count}</span>
    <MiniBar value={count} max={total} color={color} />
  </div>
)

// ─── Table row ────────────────────────────────────────────────────────────────
const TableRow = ({ resource: res, isSelected, onToggle, onEdit, onDelete, onView, formatTime, confirmId, setConfirmId, onQR }) => {
  const style = getTypeStyle(res.type)
  const isConfirming = confirmId === res.id

  return (
    <tr className="group border-b border-slate-100 hover:bg-slate-50 transition-colors">
      {/* Checkbox */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(res.id)}
          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
        />
      </td>

      {/* ID */}
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">#{res.id}</span>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <button
          onClick={() => onView(res.id)}
          className="group/name text-left"
        >
          <p className="text-sm font-semibold text-slate-800 group-hover/name:text-primary-600 transition-colors">{res.name}</p>
          <p className="text-xs text-slate-400 truncate max-w-[200px]">{res.description || '—'}</p>
        </button>
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ring-1 ${style.badge}`}>
          {res.type}
        </span>
      </td>

      {/* Location */}
      <td className="hidden md:table-cell px-4 py-3 text-sm text-slate-500">{res.location}</td>

      {/* Capacity */}
      <td className="hidden lg:table-cell px-4 py-3 text-sm text-slate-600 font-medium">{res.capacity}</td>

      {/* Availability */}
      <td className="hidden xl:table-cell px-4 py-3 text-xs text-slate-400">
        {formatTime(res.availabilityStart)} – {formatTime(res.availabilityEnd)}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={res.status} />
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {/* View */}
          <button
            onClick={() => onView(res.id)}
            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            title="View detail"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          
          {/* Smart QR Tag */}
          <button
            onClick={() => onQR(res)}
            className="p-1.5 text-slate-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-all"
            title="Generate Asset Tag (QR)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>

          {isConfirming ? (
            <>
              <span className="text-xs text-red-500 font-medium">Delete?</span>
              <button
                onClick={() => onDelete(res.id)}
                className="px-2 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmId(null)}
                className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                No
              </button>
            </>
          ) : (
            <>
              {/* Edit */}
              <button
                onClick={() => onEdit(res)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Edit resource"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              {/* Delete */}
              <button
                onClick={() => setConfirmId(res.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Delete resource"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminResourcesPage = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const forceAdmin = true // 🚨 TEMPORARY UI TESTING OVERRIDE

  const [resources, setResources]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter]   = useState('')
  const [confirmId, setConfirmId]     = useState(null)
  const [selected, setSelected]       = useState(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentResource, setCurrentResource] = useState(null)
  const [qrResource, setQrResource] = useState(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────
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

  // ── Filtered view ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return resources.filter(r => {
      const q = search.toLowerCase()
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.location.toLowerCase().includes(q)
      const matchStatus = !statusFilter || r.status === statusFilter
      const matchType   = !typeFilter  || r.type.toLowerCase().includes(typeFilter.toLowerCase())
      return matchSearch && matchStatus && matchType
    })
  }, [resources, search, statusFilter, typeFilter])

  // ── Analytics ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active = resources.filter(r => r.status === 'ACTIVE').length
    const oos    = resources.length - active
    const typeCounts = resources.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1
      return acc
    }, {})
    const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])
    const totalCap = resources.reduce((sum, r) => sum + (r.capacity || 0), 0)
    const avgCap   = resources.length ? Math.round(totalCap / resources.length) : 0
    const locations = new Set(resources.map(r => r.location)).size
    return { total: resources.length, active, oos, typeCounts: sorted, totalCap, avgCap, locations }
  }, [resources])

  // ── Unique type options for filter ─────────────────────────────────────────
  const typeOptions = useMemo(() => {
    return [...new Set(resources.map(r => r.type))].sort()
  }, [resources])

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const toggleAll = () => {
    setSelected(prev =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map(r => r.id))
    )
  }

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const handleAddClick  = () => { setCurrentResource(null); setIsModalOpen(true) }
  const handleEditClick = (resource) => { setCurrentResource(resource); setIsModalOpen(true) }
  const handleViewClick = (id) => navigate(`/resources/${id}`)

  const handleDelete = async (id) => {
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
        toast.success('Resource updated')
      } else {
        await createResource(formData)
        toast.success('Resource created')
      }
      setIsModalOpen(false)
      fetchResources()
    } catch (err) {
      toast.error(err.response?.status === 400 ? 'Please check your input values' : 'Operation failed')
    }
  }

  // ── Bulk delete ────────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!selected.size) return
    setBulkDeleting(true)
    let succeeded = 0
    for (const id of selected) {
      try {
        await deleteResource(id)
        succeeded++
      } catch { /* continue */ }
    }
    toast.success(`Deleted ${succeeded} resource${succeeded !== 1 ? 's' : ''}`)
    setSelected(new Set())
    setBulkDeleting(false)
    fetchResources()
  }

  // ── CSV export ─────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const rows = [
      ['ID', 'Name', 'Type', 'Location', 'Capacity', 'Status', 'Avail Start', 'Avail End', 'Description'],
      ...resources.map(r => [
        r.id, r.name, r.type, r.location, r.capacity, r.status,
        r.availabilityStart, r.availabilityEnd, r.description || ''
      ])
    ]
    const csv     = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob    = new Blob([csv], { type: 'text/csv' })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement('a')
    a.href        = url
    a.download    = `campus-resources-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported successfully')
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A'
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours, 10)
    return `${h % 12 || 12}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout fullWidth noPadding>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-slate-50">

        {/* Sidebar */}
        <div className="w-full lg:w-[260px] shrink-0 bg-white border-r border-slate-200 z-30 shadow-sm relative pt-4">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <FacilitiesSidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Page Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-2">
                  <Link to="/dashboard" className="hover:text-slate-600 transition-colors">Smart Campus</Link>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  <Link to="/resources" className="hover:text-slate-600 transition-colors">Facilities</Link>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  <span className="text-slate-700 font-semibold">Admin Panel</span>
                </nav>
                <h1 className="text-xl font-extrabold text-slate-900">Resource Management</h1>
                <p className="text-sm text-slate-500 mt-0.5">Full CRUD control over all campus facilities and assets</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Export CSV */}
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </button>

                {/* Add Resource */}
                {(isAdmin || forceAdmin) && (
                  <button
                    onClick={handleAddClick}
                    id="admin-add-resource-btn"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-sm shadow-primary-500/20"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Resource
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Total Resources"
                value={stats.total}
                sub={`${stats.locations} location${stats.locations !== 1 ? 's' : ''}`}
                accent="bg-slate-100"
                icon={<svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
              />
              <KpiCard
                label="Active"
                value={stats.active}
                sub={`${stats.total ? Math.round((stats.active / stats.total) * 100) : 0}% availability`}
                accent="bg-primary-50"
                icon={<svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <KpiCard
                label="Out of Service"
                value={stats.oos}
                sub="Requires attention"
                accent="bg-red-50"
                icon={<svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <KpiCard
                label="Avg. Capacity"
                value={stats.avgCap}
                sub={`Total: ${stats.totalCap} seats`}
                accent="bg-amber-50"
                icon={<svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              />
            </div>

            {/* ── Analytics + Filters Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Type Breakdown */}
              <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="text-sm font-bold text-slate-700">Resource Types</h3>
                </div>
                {loading ? (
                  <div className="flex justify-center py-4"><LoadingSpinner /></div>
                ) : stats.typeCounts.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.typeCounts.slice(0, 7).map(([type, count]) => {
                      const style = getTypeStyle(type)
                      return (
                        <BreakdownRow
                          key={type}
                          label={type}
                          count={count}
                          total={stats.total}
                          color={style.dot}
                        />
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Status pie‑like breakdown */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-bold text-slate-700">System Overview</h3>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span className="font-medium">Active Resources</span>
                      <span className="font-bold text-primary-600">{stats.active} / {stats.total}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-700"
                        style={{ width: `${stats.total ? (stats.active / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span className="font-medium">Out of Service</span>
                      <span className="font-bold text-red-500">{stats.oos} / {stats.total}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-700"
                        style={{ width: `${stats.total ? (stats.oos / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick action chips */}
                <div className="mt-auto pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                  <button
                    onClick={() => { setStatusFilter('ACTIVE'); setTypeFilter(''); setSearch('') }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                  >
                    View Active Only
                  </button>
                  <button
                    onClick={() => { setStatusFilter('OUT_OF_SERVICE'); setTypeFilter(''); setSearch('') }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    View Out of Service
                  </button>
                  <button
                    onClick={() => { setStatusFilter(''); setTypeFilter(''); setSearch('') }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* ── Search & Filter Bar ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex flex-wrap items-stretch divide-x divide-slate-100">
                {/* Text search */}
                <div className="flex-1 min-w-[200px] relative flex items-center">
                  <svg className="w-4 h-4 absolute left-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, type or location…"
                    className="w-full pl-10 pr-4 py-3.5 text-sm text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                </div>

                {/* Type filter */}
                <div className="relative flex items-center">
                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="w-40 px-4 py-3.5 text-sm text-slate-700 bg-transparent focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="">All Types</option>
                    {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <svg className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Status filter */}
                <div className="relative flex items-center">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-40 px-4 py-3.5 text-sm text-slate-700 bg-transparent focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                  </select>
                  <svg className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Results count */}
                <div className="flex items-center px-4 py-2 text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">{filtered.length}</span>&nbsp;result{filtered.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* ── Bulk Action Bar (visible when rows selected) ── */}
            {selected.size > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {selected.size} resource{selected.size !== 1 ? 's' : ''} selected
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelected(new Set())}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-white hover:bg-amber-50 border border-amber-200 rounded-lg transition-colors"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {bulkDeleting ? (
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    {bulkDeleting ? 'Deleting…' : `Delete ${selected.size}`}
                  </button>
                </div>
              </div>
            )}

            {/* ── Data Table ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="py-24 flex justify-center"><LoadingSpinner /></div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 mb-1">No resources found</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    {search || statusFilter || typeFilter ? 'Try adjusting your search or filters.' : 'Add your first resource to get started.'}
                  </p>
                  {(isAdmin || forceAdmin) && (
                    <button
                      onClick={handleAddClick}
                      className="px-4 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
                    >
                      Add Resource
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.size === filtered.length && filtered.length > 0}
                            onChange={toggleAll}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">ID</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                        <th className="hidden md:table-cell px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</th>
                        <th className="hidden lg:table-cell px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cap.</th>
                        <th className="hidden xl:table-cell px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Availability</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(res => (
                        <TableRow
                          key={res.id}
                          resource={res}
                          isSelected={selected.has(res.id)}
                          onToggle={toggleOne}
                          onEdit={handleEditClick}
                          onDelete={handleDelete}
                          onView={handleViewClick}
                          formatTime={formatTime}
                          confirmId={confirmId}
                          setConfirmId={setConfirmId}
                          onQR={setQrResource}
                        />
                      ))}
                    </tbody>
                  </table>

                  {/* Table footer */}
                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-400">
                    <span>Showing <strong className="text-slate-700">{filtered.length}</strong> of <strong className="text-slate-700">{resources.length}</strong> resources</span>
                    <span>Last refreshed: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Resource Modal */}
      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        isEditing={!!currentResource}
        resource={currentResource}
      />

      {/* Modern Feature: Smart QR Tag Modal */}
      {qrResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setQrResource(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col items-center text-center animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="w-full bg-primary-600 px-6 py-6 border-b border-primary-500">
              <h2 className="text-xl font-black text-white tracking-tight">{qrResource.name}</h2>
              <p className="text-primary-100 text-xs font-semibold uppercase tracking-widest mt-1">Smart Asset Tag</p>
            </div>
            <div className="p-8">
              <div className="w-48 h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMyMmM1NWUiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxyZWN0IHg9IjciIHk9IjciIHdpZHRoPSIzIiBoZWlnaHQ9IjMiPjwvcmVjdD48cmVjdCB4PSIxNCIgeT0iNyIgd2lkdGg9IjMiIGhlaWdodD0iMyI+PC9yZWN0PjxyZWN0IHg9IjciIHk9IjE0IiB3aWR0aD0iMyIgaGVpZ2h0PSIzIj48L3JlY3Q+PHJlY3QgeD0iMTQiIHk9IjE0IiB3aWR0aD0iMyIgaGVpZ2h0PSIzIj48L3JlY3Q+PC9zdmc+')] opacity-40 bg-[length:24px_24px] bg-center mix-blend-multiply" />
                <svg className="w-24 h-24 text-primary-600 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                {/* Scanning animation line */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-primary-400 shadow-[0_0_10px_#34D399] animate-[slideDown_3s_ease-in-out_infinite]" />
              </div>
              <p className="text-sm font-semibold text-slate-700 mb-1">{qrResource.location}</p>
              <p className="text-xs text-slate-400">ID: {qrResource.id}</p>
            </div>
            <div className="w-full p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-sm font-bold text-slate-700 rounded-xl transition-colors" onClick={() => setQrResource(null)}>Close</button>
              <button className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm" onClick={() => {toast.success('Downloaded Asset Tag'); setQrResource(null);}}>Download</button>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `\n            @keyframes slideDown {\n              0% { top: 0; opacity: 0; }\n              10% { opacity: 1; }\n              90% { opacity: 1; }\n              100% { top: 100%; opacity: 0; }\n            }\n          `}} />
        </div>
      )}
    </Layout>
  )
}

export default AdminResourcesPage
