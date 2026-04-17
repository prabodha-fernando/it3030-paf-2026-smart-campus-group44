import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../components/common/Layout'
import useAuth from '../hooks/useAuth'
import { API_BASE } from '../utils/constants'
import { getAllUsers } from '../api/authApi'
import {
  addTicketComment,
  assignTechnician,
  createTicket,
  getTicketAttachments,
  getTicketById,
  getTicketComments,
  getTickets,
  updateTicketStatus,
  uploadTicketAttachment,
} from '../api/ticketApi'

const STATUS_COLORS = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-accent-100 text-accent-800',
  RESOLVED: 'bg-primary-100 text-primary-800',
  CLOSED: 'bg-stone-100 text-stone-600',
}

const PRIORITY_COLORS = {
  LOW: 'bg-stone-100 text-stone-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-700',
}

const TicketsPage = () => {
  const { user, isAdmin } = useAuth()

  const [tickets, setTickets] = useState([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedId, setSelectedId] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [attachments, setAttachments] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [assigneeId, setAssigneeId] = useState('')

  const [newComment, setNewComment] = useState('')
  const [detailUploadFileName, setDetailUploadFileName] = useState('No file chosen')
  const [createForm, setCreateForm] = useState({
    category: 'FACILITY',
    priority: 'MEDIUM',
    description: '',
    file: null,
  })

  const [loadingList, setLoadingList] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const filteredTickets = useMemo(() => {
    if (statusFilter === 'ALL') return tickets
    return tickets.filter((t) => t.status === statusFilter)
  }, [tickets, statusFilter])

  const ticketStats = useMemo(() => {
    const stats = {
      total: tickets.length,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
    }

    tickets.forEach((t) => {
      if (t.status === 'OPEN') stats.open += 1
      if (t.status === 'IN_PROGRESS') stats.inProgress += 1
      if (t.status === 'RESOLVED') stats.resolved += 1
      if (t.status === 'CLOSED') stats.closed += 1
    })

    return stats
  }, [tickets])

  const loadTickets = async (keepSelection = true) => {
    setLoadingList(true)
    try {
      const { data } = await getTickets()
      if (!Array.isArray(data)) {
        throw new Error('Unexpected tickets response format')
      }
      setTickets(data)

      if (data.length === 0) {
        setSelectedId(null)
        return
      }

      if (!keepSelection || !data.some((t) => t.id === selectedId)) {
        setSelectedId(data[0].id)
      }
    } catch {
      toast.error('Failed to load tickets')
    } finally {
      setLoadingList(false)
    }
  }

  const loadDetail = async (id) => {
    if (!id) return
    setLoadingDetail(true)
    try {
      const [ticketRes, commentsRes, attachmentsRes] = await Promise.all([
        getTicketById(id),
        getTicketComments(id),
        getTicketAttachments(id),
      ])

      setSelectedTicket(ticketRes.data)
      setComments(commentsRes.data)
      setAttachments(attachmentsRes.data)
      setAssigneeId(ticketRes.data?.assignedTo?.id ? String(ticketRes.data.assignedTo.id) : '')
    } catch {
      toast.error('Failed to load ticket details')
    } finally {
      setLoadingDetail(false)
    }
  }

  useEffect(() => { loadTickets(false) }, [])

  useEffect(() => { loadDetail(selectedId) }, [selectedId])

  useEffect(() => {
    if (!isAdmin) return
    getAllUsers({ role: 'TECHNICIAN', page: 0, size: 100 })
      .then(({ data }) => setTechnicians(data))
      .catch(() => {})
  }, [isAdmin])

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!createForm.description.trim()) {
      toast.error('Description is required')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        category: createForm.category,
        priority: createForm.priority,
        description: createForm.description.trim(),
      }

      const { data: created } = await createTicket(payload)

      if (createForm.file) {
        await uploadTicketAttachment(created.id, createForm.file)
      }

      toast.success('Ticket created')
      setCreateForm({ category: 'FACILITY', priority: 'MEDIUM', description: '', file: null })
      await loadTickets(false)
      setSelectedId(created.id)
    } catch {
      toast.error('Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (status) => {
    if (!selectedTicket) return
    try {
      await updateTicketStatus(selectedTicket.id, status)
      toast.success('Status updated')
      await loadTickets(true)
      await loadDetail(selectedTicket.id)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return
    try {
      await addTicketComment(selectedTicket.id, newComment.trim())
      setNewComment('')
      await loadDetail(selectedTicket.id)
      toast.success('Comment added')
    } catch {
      toast.error('Failed to add comment')
    }
  }

  const handleUpload = async (file) => {
    if (!selectedTicket || !file) return
    try {
      await uploadTicketAttachment(selectedTicket.id, file)
      await loadDetail(selectedTicket.id)
      toast.success('File uploaded')
    } catch {
      toast.error('Failed to upload file')
    }
  }

  const handleAssign = async () => {
    if (!selectedTicket || !assigneeId) return
    try {
      await assignTechnician(selectedTicket.id, assigneeId)
      await loadTickets(true)
      await loadDetail(selectedTicket.id)
      toast.success('Technician assigned')
    } catch {
      toast.error('Failed to assign technician')
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">My Tickets</h1>
              <p className="mt-1 text-sm text-stone-500">Create tickets, track status, and collaborate with comments and images.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-center">
                <p className="text-[11px] uppercase tracking-wide text-stone-500">Total</p>
                <p className="text-lg font-semibold text-stone-900">{ticketStats.total}</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-center">
                <p className="text-[11px] uppercase tracking-wide text-blue-600">Open</p>
                <p className="text-lg font-semibold text-blue-700">{ticketStats.open}</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center">
                <p className="text-[11px] uppercase tracking-wide text-amber-700">In Progress</p>
                <p className="text-lg font-semibold text-amber-700">{ticketStats.inProgress}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center">
                <p className="text-[11px] uppercase tracking-wide text-emerald-700">Resolved</p>
                <p className="text-lg font-semibold text-emerald-700">{ticketStats.resolved}</p>
              </div>
              <div className="rounded-xl border border-stone-300 bg-stone-100 px-3 py-2 text-center">
                <p className="text-[11px] uppercase tracking-wide text-stone-600">Closed</p>
                <p className="text-lg font-semibold text-stone-700">{ticketStats.closed}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">Create ticket</h2>
          <form onSubmit={handleCreateTicket} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <select
                className="input-field"
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
              >
                <option value="FACILITY">Facility</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="NETWORK">Network</option>
                <option value="SECURITY">Security</option>
                <option value="OTHER">Other</option>
              </select>

              <select
                className="input-field"
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>

              <input
                type="file"
                accept="image/*"
                id="create-ticket-file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setCreateForm({ ...createForm, file })
                }}
              />
              <label
                htmlFor="create-ticket-file"
                className="input-field flex cursor-pointer items-center justify-between"
              >
                <span className="truncate text-stone-500">{createForm.file?.name || 'Choose an image file'}</span>
                <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">Browse</span>
              </label>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create ticket'}
              </button>
            </div>

            <textarea
              rows={4}
              className="input-field"
              placeholder="Describe the issue in detail"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />
          </form>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:col-span-1">
            <div className="flex items-center justify-between border-b border-stone-100 p-4">
              <h2 className="text-base font-semibold text-stone-900">Ticket list</h2>
              <select
                className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="max-h-[620px] divide-y divide-stone-100 overflow-y-auto">
              {loadingList && <p className="p-4 text-sm text-stone-500">Loading tickets...</p>}
              {!loadingList && filteredTickets.length === 0 && <p className="p-4 text-sm text-stone-400">No tickets found.</p>}

              {!loadingList && filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full space-y-2 p-4 text-left transition-colors hover:bg-stone-50 ${selectedId === t.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-stone-900">#{t.id} {t.category}</p>
                    <span className={`badge text-[10px] ${STATUS_COLORS[t.status] || 'bg-stone-100 text-stone-600'}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-stone-500">{t.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`badge text-[10px] ${PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.MEDIUM}`}>
                      {t.priority || 'MEDIUM'}
                    </span>
                    <p className="text-[11px] text-stone-400">{t.user?.displayName || t.user?.email || 'Reporter'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm lg:col-span-2">
            {!selectedTicket && <p className="text-sm text-stone-400">Select a ticket to see details.</p>}
            {loadingDetail && <p className="text-sm text-stone-500">Loading details...</p>}

            {selectedTicket && !loadingDetail && (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-stone-900">Ticket #{selectedTicket.id}</h2>
                    <p className="mt-1 text-sm text-stone-500">{selectedTicket.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`badge ${STATUS_COLORS[selectedTicket.status] || 'bg-stone-100 text-stone-600'}`}>
                      {selectedTicket.status}
                    </span>
                    <span className={`badge ${PRIORITY_COLORS[selectedTicket.priority] || PRIORITY_COLORS.MEDIUM}`}>
                      {selectedTicket.priority || 'MEDIUM'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <p className="text-xs text-stone-500">Category</p>
                    <p className="text-sm font-medium text-stone-800">{selectedTicket.category}</p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <p className="text-xs text-stone-500">Priority</p>
                    <p className="text-sm font-medium text-stone-800">{selectedTicket.priority || 'MEDIUM'}</p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <p className="text-xs text-stone-500">Reporter</p>
                    <p className="truncate text-sm font-medium text-stone-800">{selectedTicket.user?.displayName || selectedTicket.user?.email || '-'}</p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <p className="text-xs text-stone-500">Assigned</p>
                    <p className="truncate text-sm font-medium text-stone-800">{selectedTicket.assignedTo?.displayName || '-'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Update status</p>
                  <div className="flex flex-wrap gap-2">
                    {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                      <button
                        key={s}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium ${selectedTicket.status === s ? 'border-slate-900 bg-slate-900 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
                        onClick={() => handleStatusUpdate(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {isAdmin && (
                  <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Assign technician</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select className="input-field" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                        <option value="">Select technician</option>
                        {technicians.map((u) => (
                          <option key={u.id} value={u.id}>{u.displayName || u.email}</option>
                        ))}
                      </select>
                      <button className="btn-secondary" onClick={handleAssign} disabled={!assigneeId}>Assign</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2 rounded-xl border border-stone-200 p-3">
                    <h3 className="text-sm font-semibold text-stone-800">Comments</h3>
                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                      {comments.length === 0 && <p className="text-sm text-stone-400">No comments yet.</p>}
                      {comments.map((c) => (
                        <div key={c.id} className="rounded-lg bg-stone-50 p-2.5">
                          <p className="text-xs text-stone-500">{c.author?.displayName || c.author?.email || 'User'}</p>
                          <p className="mt-0.5 text-sm text-stone-800">{c.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="input-field"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment"
                      />
                      <button className="btn-secondary" onClick={handleAddComment}>Post</button>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-stone-200 p-3">
                    <h3 className="text-sm font-semibold text-stone-800">Images / attachments</h3>
                    <input
                      type="file"
                      accept="image/*"
                      id="detail-upload-file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setDetailUploadFileName(file?.name || 'No file chosen')
                        handleUpload(file)
                      }}
                    />
                    <label
                      htmlFor="detail-upload-file"
                      className="input-field flex cursor-pointer items-center justify-between"
                    >
                      <span className="truncate text-stone-500">{detailUploadFileName}</span>
                      <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">Browse</span>
                    </label>
                    <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1">
                      {attachments.length === 0 && <p className="col-span-2 text-sm text-stone-400">No attachments.</p>}
                      {attachments.map((a) => {
                        const src = `${API_BASE}/${a.filePath}`.replace(/([^:]\/)\/+/, '$1')
                        return (
                          <a href={src} target="_blank" rel="noreferrer" key={a.id} className="block">
                            <img
                              src={src}
                              alt={a.fileName}
                              className="h-24 w-full rounded-lg border border-stone-200 object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                            <p className="mt-1 truncate text-[11px] text-stone-500">{a.fileName}</p>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default TicketsPage
