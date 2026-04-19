import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import Layout from '../components/common/Layout'
import PageTitle from '../components/common/PageTitle'
import useAuth from '../hooks/useAuth'
import { API_BASE } from '../utils/constants'
import { getRoleBadgeClass, getRoleLabel } from '../utils/roleUtils'
import { getAllUsers } from '../api/authApi'
import { getAllResources } from '../api/resourceApi'
import {
  addTicketComment,
  assignTechnician,
  createTicket,
  deleteTicket,
  deleteTicketAttachment,
  deleteTicketComment,
  editTicketComment,
  getTicketAttachments,
  getTicketById,
  getTicketComments,
  getTickets,
  updateTicket,
  updateTicketStatus,
  updateTicketResolutionNotes,
  uploadTicketAttachment,
} from '../api/ticketApi'

const STATUS_COLORS = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-accent-100 text-accent-800',
  RESOLVED: 'bg-primary-100 text-primary-800',
  CLOSED: 'bg-stone-100 text-stone-600',
  REJECTED: 'bg-red-100 text-red-700',
}

const PRIORITY_COLORS = {
  LOW: 'bg-stone-100 text-stone-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-red-100 text-red-700',
}

const MAX_DESCRIPTION_LENGTH = 2000
const MAX_RESOURCE_LOCATION_LENGTH = 150
const MAX_PREFERRED_CONTACT_LENGTH = 100
const MAX_COMMENT_LENGTH = 2000
const MAX_REJECTION_REASON_LENGTH = 500
const MAX_RESOLUTION_NOTES_LENGTH = 3000
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

const TicketsPage = () => {
  const { user, isAdmin } = useAuth()

  const [tickets, setTickets] = useState([])
  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [resourceLoadError, setResourceLoadError] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedId, setSelectedId] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [attachments, setAttachments] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [securityOfficers, setSecurityOfficers] = useState([])
  const [facilityManagers, setFacilityManagers] = useState([])
  const [assigneeId, setAssigneeId] = useState('')
  const createFileInputRef = useRef(null)
  const ticketAttachmentInputRef = useRef(null)
  const detailFileInputRef = useRef(null)
  const editFileInputRef = useRef(null)

  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [ticketUploadFileName, setTicketUploadFileName] = useState('No file chosen')
  const [detailUploadFileName, setDetailUploadFileName] = useState('No file chosen')
  const [adminImageFile, setAdminImageFile] = useState(null)
  const [adminStatusDraft, setAdminStatusDraft] = useState('OPEN')
  const [rejectReason, setRejectReason] = useState('')
  const [resolutionDraft, setResolutionDraft] = useState('')
  const [isEditingTicket, setIsEditingTicket] = useState(false)
  const [editAttachmentFile, setEditAttachmentFile] = useState(null)
  const [editAttachmentFileName, setEditAttachmentFileName] = useState('No file chosen')
  const [editRemovedAttachmentIds, setEditRemovedAttachmentIds] = useState([])
  const [editTicketForm, setEditTicketForm] = useState({
    category: 'FACILITY',
    priority: 'MEDIUM',
    resourceId: '',
    resourceOrLocation: '',
    preferredContact: '',
    description: '',
  })
  const [createForm, setCreateForm] = useState({
    category: '',
    priority: '',
    resourceId: '',
    description: '',
    resourceOrLocation: '',
    preferredContact: '',
    file: null,
  })

  const [loadingList, setLoadingList] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadResources = async () => {
    setLoadingResources(true)
    setResourceLoadError('')
    try {
      const list = await getAllResources()
      if (!Array.isArray(list)) {
        setResources([])
        setResourceLoadError('Unexpected resources response')
        return
      }
      setResources(list)
    } catch (error) {
      const status = error?.response?.status
      if (status === 401) {
        setResourceLoadError('Session expired. Please re-login.')
      } else {
        setResourceLoadError('Failed to load resources')
      }
    } finally {
      setLoadingResources(false)
    }
  }

  const validateFile = (file) => {
    if (!file) return 'File is required'
    const mime = (file.type || '').toLowerCase()
    if (!ALLOWED_FILE_TYPES.includes(mime)) {
      return 'Only PNG, JPG, JPEG, or WEBP files are allowed'
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return 'File exceeds max size of 5MB'
    }
    return null
  }

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
      rejected: 0,
    }

    tickets.forEach((t) => {
      if (t.status === 'OPEN') stats.open += 1
      if (t.status === 'IN_PROGRESS') stats.inProgress += 1
      if (t.status === 'RESOLVED') stats.resolved += 1
      if (t.status === 'CLOSED') stats.closed += 1
      if (t.status === 'REJECTED') stats.rejected += 1
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
      setTicketUploadFileName('No file chosen')
      setAdminStatusDraft(ticketRes.data?.status || 'OPEN')
      setDetailUploadFileName('No file chosen')
      setAdminImageFile(null)
      setRejectReason(ticketRes.data?.rejectionReason || '')
      setResolutionDraft(ticketRes.data?.resolutionNotes || '')
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
    setEditingCommentId(null)
    setEditingCommentText('')
    setNewComment('')
    setIsEditingTicket(false)
    setTicketUploadFileName('No file chosen')
    setDetailUploadFileName('No file chosen')
    setAdminImageFile(null)
    setEditAttachmentFile(null)
    setEditAttachmentFileName('No file chosen')
    setEditRemovedAttachmentIds([])
  }, [selectedId])

  useEffect(() => {
    if (!selectedTicket) return
    setEditTicketForm({
      category: selectedTicket.category || 'FACILITY',
      priority: selectedTicket.priority || 'MEDIUM',
      resourceId: selectedTicket.resourceId ? String(selectedTicket.resourceId) : '',
      resourceOrLocation: selectedTicket.resourceOrLocation || '',
      preferredContact: selectedTicket.preferredContact || '',
      description: selectedTicket.description || '',
    })
  }, [selectedTicket])

  useEffect(() => { loadResources() }, [])

  useEffect(() => {
    if (!isAdmin) return

    Promise.all([
      getAllUsers({ role: 'TECHNICIAN', page: 0, size: 100 }),
      getAllUsers({ role: 'SECURITY_OFFICER', page: 0, size: 100 }),
      getAllUsers({ role: 'FACILITY_MANAGER', page: 0, size: 100 }),
    ])
      .then(([techRes, secRes, fmRes]) => {
        setTechnicians(techRes.data || [])
        setSecurityOfficers(secRes.data || [])
        setFacilityManagers(fmRes.data || [])
      })
      .catch(() => {
        setTechnicians([])
        setSecurityOfficers([])
        setFacilityManagers([])
      })
  }, [isAdmin])

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    const description = createForm.description.trim()
    const resourceOrLocation = createForm.resourceOrLocation.trim()
    const preferredContact = createForm.preferredContact.trim()
    const parsedResourceId = createForm.resourceId ? Number(createForm.resourceId) : null

    if (!createForm.category) {
      toast.error('Category is required')
      return
    }

    if (!createForm.priority) {
      toast.error('Priority is required')
      return
    }

    if (parsedResourceId !== null && (!Number.isInteger(parsedResourceId) || parsedResourceId <= 0)) {
      toast.error('Please select a valid resource')
      return
    }

    if (!description) {
      toast.error('Description is required')
      return
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      toast.error(`Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters`)
      return
    }

    if (resourceOrLocation.length > MAX_RESOURCE_LOCATION_LENGTH) {
      toast.error(`Resource/Location must not exceed ${MAX_RESOURCE_LOCATION_LENGTH} characters`)
      return
    }

    if (preferredContact.length > MAX_PREFERRED_CONTACT_LENGTH) {
      toast.error(`Preferred contact must not exceed ${MAX_PREFERRED_CONTACT_LENGTH} characters`)
      return
    }

    if (createForm.file) {
      const fileError = validateFile(createForm.file)
      if (fileError) {
        toast.error(fileError)
        return
      }
    }

    setSubmitting(true)
    try {
      const selectedResource = parsedResourceId
        ? resources.find((r) => String(r.id) === String(parsedResourceId))
        : null

      const payload = {
        category: createForm.category,
        priority: createForm.priority,
        description,
        resourceId: parsedResourceId,
        resourceOrLocation: resourceOrLocation || (selectedResource
          ? selectedResource.location
          : null),
        preferredContact: preferredContact || null,
      }

      const { data: created } = await createTicket(payload)

      if (createForm.file) {
        await uploadTicketAttachment(created.id, createForm.file)
      }

      toast.success('Ticket created')
      setCreateForm({
        category: '',
        priority: '',
        resourceId: '',
        description: '',
        resourceOrLocation: '',
        preferredContact: '',
        file: null,
      })
      await loadTickets(false)
      setSelectedId(created.id)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusUpdate = async (status) => {
    if (!selectedTicket) return

    const reason = rejectReason.trim()
    if (status === 'REJECTED') {
      if (!reason) {
        toast.error('Rejection reason is required')
        return
      }
      if (reason.length > MAX_REJECTION_REASON_LENGTH) {
        toast.error(`Rejection reason must not exceed ${MAX_REJECTION_REASON_LENGTH} characters`)
        return
      }
    }

    try {
      await updateTicketStatus(selectedTicket.id, {
        status,
        reason: status === 'REJECTED' ? reason : undefined,
      })
      toast.success('Status updated')
      await loadTickets(true)
      await loadDetail(selectedTicket.id)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status')
    }
  }

  const handleSaveTicketEdit = async () => {
    if (!selectedTicket) return

    const description = editTicketForm.description.trim()
    const location = editTicketForm.resourceOrLocation.trim()
    const preferredContact = editTicketForm.preferredContact.trim()
    const parsedResourceId = editTicketForm.resourceId ? Number(editTicketForm.resourceId) : null

    if (!description) {
      toast.error('Description is required')
      return
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      toast.error(`Description must not exceed ${MAX_DESCRIPTION_LENGTH} characters`)
      return
    }

    if (location.length > MAX_RESOURCE_LOCATION_LENGTH) {
      toast.error(`Location must not exceed ${MAX_RESOURCE_LOCATION_LENGTH} characters`)
      return
    }

    if (preferredContact.length > MAX_PREFERRED_CONTACT_LENGTH) {
      toast.error(`Preferred contact must not exceed ${MAX_PREFERRED_CONTACT_LENGTH} characters`)
      return
    }

    if (parsedResourceId !== null && (!Number.isInteger(parsedResourceId) || parsedResourceId <= 0)) {
      toast.error('Please select a valid resource')
      return
    }

    const selectedResource = parsedResourceId
      ? resources.find((r) => String(r.id) === String(parsedResourceId))
      : null

    if (editAttachmentFile) {
      const fileError = validateFile(editAttachmentFile)
      if (fileError) {
        toast.error(fileError)
        return
      }

      const remainingCount = attachments.length - editRemovedAttachmentIds.length
      if (remainingCount >= 3) {
        toast.error('Maximum 3 attachments are allowed per ticket')
        return
      }
    }

    try {
      await updateTicket(selectedTicket.id, {
        category: editTicketForm.category,
        priority: editTicketForm.priority,
        description,
        resourceId: parsedResourceId,
        resourceOrLocation: location || (selectedResource ? selectedResource.location : null),
        preferredContact: preferredContact || null,
      })

      for (const attachmentId of editRemovedAttachmentIds) {
        await deleteTicketAttachment(selectedTicket.id, attachmentId)
      }

      if (editAttachmentFile) {
        await uploadTicketAttachment(selectedTicket.id, editAttachmentFile)
      }

      toast.success('Ticket updated')
      setIsEditingTicket(false)
      setEditAttachmentFile(null)
      setEditAttachmentFileName('No file chosen')
      setEditRemovedAttachmentIds([])
      await loadTickets(true)
      await loadDetail(selectedTicket.id)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update ticket')
    }
  }

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return
    const confirmed = window.confirm('Delete this ticket? This action cannot be undone.')
    if (!confirmed) return

    try {
      await deleteTicket(selectedTicket.id)
      toast.success('Ticket deleted')
      await loadTickets(false)
      setSelectedTicket(null)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete ticket')
    }
  }

  const handleAddComment = async () => {
    if (!selectedTicket) return
    const content = newComment.trim()
    if (!content) {
      toast.error('Comment is required')
      return
    }
    if (content.length > MAX_COMMENT_LENGTH) {
      toast.error(`Comment must not exceed ${MAX_COMMENT_LENGTH} characters`)
      return
    }

    try {
      await addTicketComment(selectedTicket.id, content)
      setNewComment('')
      await loadDetail(selectedTicket.id)
      toast.success('Comment added')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add comment')
    }
  }

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id)
    setEditingCommentText(comment.content || '')
  }

  const cancelEditComment = () => {
    setEditingCommentId(null)
    setEditingCommentText('')
  }

  const handleEditComment = async () => {
    if (!selectedTicket || !editingCommentId) return
    const content = editingCommentText.trim()
    if (!content) {
      toast.error('Comment is required')
      return
    }
    if (content.length > MAX_COMMENT_LENGTH) {
      toast.error(`Comment must not exceed ${MAX_COMMENT_LENGTH} characters`)
      return
    }

    try {
      await editTicketComment(selectedTicket.id, editingCommentId, content)
      await loadDetail(selectedTicket.id)
      cancelEditComment()
      toast.success('Comment updated')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!selectedTicket) return
    try {
      await deleteTicketComment(selectedTicket.id, commentId)
      await loadDetail(selectedTicket.id)
      toast.success('Comment deleted')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete comment')
    }
  }

  const handleUpload = async (file) => {
    if (!selectedTicket || !file) return

    if (attachments.length >= 3) {
      toast.error('Maximum 3 attachments are allowed per ticket')
      return
    }

    const fileError = validateFile(file)
    if (fileError) {
      toast.error(fileError)
      return
    }

    try {
      await uploadTicketAttachment(selectedTicket.id, file)
      await loadDetail(selectedTicket.id)
      toast.success('File uploaded')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload file')
    }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    if (!selectedTicket) return
    const confirmed = window.confirm('Remove this attachment?')
    if (!confirmed) return

    try {
      await deleteTicketAttachment(selectedTicket.id, attachmentId)
      await loadDetail(selectedTicket.id)
      toast.success('Attachment removed')
    } catch (err) {
      const message = err?.response?.data?.message || ''
      if (message.includes('No static resource')) {
        toast.error('Attachment delete API is not active on backend yet. Please restart backend and retry.')
        return
      }
      toast.error(message || 'Failed to remove attachment')
    }
  }

  const handleAssign = async () => {
    if (!selectedTicket) return
    if (!assigneeId) {
      toast.error('Please select a staff member to assign')
      return
    }

    try {
      await assignTechnician(selectedTicket.id, assigneeId)
      await loadTickets(true)
      await loadDetail(selectedTicket.id)
      toast.success('Technician assigned')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign technician')
    }
  }

  const handleAdminWorkflowSave = async () => {
    if (!selectedTicket || !isAdmin) return

    const nextStatus = adminStatusDraft
    const reason = rejectReason.trim()
    const notes = resolutionDraft.trim()
    const currentReason = (selectedTicket.rejectionReason || '').trim()
    const currentNotes = (selectedTicket.resolutionNotes || '').trim()

    if (nextStatus === 'REJECTED') {
      if (!reason) {
        toast.error('Rejection reason is required')
        return
      }
      if (reason.length > MAX_REJECTION_REASON_LENGTH) {
        toast.error(`Rejection reason must not exceed ${MAX_REJECTION_REASON_LENGTH} characters`)
        return
      }
    }

    if (notes.length > MAX_RESOLUTION_NOTES_LENGTH) {
      toast.error(`Resolution notes must not exceed ${MAX_RESOLUTION_NOTES_LENGTH} characters`)
      return
    }

    if (adminImageFile) {
      const fileError = validateFile(adminImageFile)
      if (fileError) {
        toast.error(fileError)
        return
      }

      if (attachments.length >= 3) {
        toast.error('Maximum 3 attachments are allowed per ticket')
        return
      }
    }

    const shouldUpdateStatus = nextStatus !== selectedTicket.status
      || (nextStatus === 'REJECTED' && reason !== currentReason)
    const shouldUpdateNotes = notes.length > 0 && notes !== currentNotes
    const shouldUploadImage = !!adminImageFile

    if (!shouldUpdateStatus && !shouldUpdateNotes && !shouldUploadImage) {
      toast('No changes to save')
      return
    }

    try {
      if (shouldUpdateStatus) {
        await updateTicketStatus(selectedTicket.id, {
          status: nextStatus,
          reason: nextStatus === 'REJECTED' ? reason : undefined,
        })
      }

      if (shouldUpdateNotes) {
        await updateTicketResolutionNotes(selectedTicket.id, notes)
      }

      if (shouldUploadImage) {
        await uploadTicketAttachment(selectedTicket.id, adminImageFile)
      }

      await loadTickets(true)
      await loadDetail(selectedTicket.id)
      toast.success('Ticket changes saved')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save ticket changes')
    }
  }

  const [isEditingResolution, setIsEditingResolution] = useState(false)

  const handleSaveResolutionNotes = async () => {
    if (!selectedTicket) return
    const notes = resolutionDraft.trim()
    if (!notes) {
      toast.error('Resolution notes are required')
      return
    }

    if (notes.length > MAX_RESOLUTION_NOTES_LENGTH) {
      toast.error(`Resolution notes must not exceed ${MAX_RESOLUTION_NOTES_LENGTH} characters`)
      return
    }

    try {
      await updateTicketResolutionNotes(selectedTicket.id, notes)
      await loadTickets(true)
      await loadDetail(selectedTicket.id)
      toast.success('Resolution notes updated')
      setIsEditingResolution(false)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update resolution notes')
    }
  }

  const canUpdateStatus = !!selectedTicket && (
    ['TECHNICIAN', 'SECURITY_OFFICER', 'FACILITY_MANAGER', 'ADMIN', 'SUPER_ADMIN']
      .includes(String(user?.role || '').toUpperCase())
  )

  const canManageTicket = !!selectedTicket && (
    isAdmin || String(selectedTicket.user?.id || '') === String(user?.id || '')
  )

  const canEditResolutionNotes = !!selectedTicket && (
    ['TECHNICIAN', 'SECURITY_OFFICER', 'FACILITY_MANAGER', 'ADMIN', 'SUPER_ADMIN']
      .includes(String(user?.role || '').toUpperCase())
  )

  const selectedTicketResourceLabel = useMemo(() => {
    if (!selectedTicket?.resourceId) return 'Not linked'
    const matched = resources.find((r) => String(r.id) === String(selectedTicket.resourceId))
    if (!matched) return `Resource #${selectedTicket.resourceId}`
    return matched.name
  }, [resources, selectedTicket])

  const selectedTicketAssignedLabel = useMemo(() => {
    const assignee = selectedTicket?.assignedTo
    if (!assignee) return 'Not assigned yet'

    const role = String(assignee.role || '').toUpperCase()
    const isAssignableStaff = ['TECHNICIAN', 'SECURITY_OFFICER', 'FACILITY_MANAGER'].includes(role)
    if (!isAssignableStaff) return 'Not assigned yet'

    return assignee.displayName || assignee.email || 'Not assigned yet'
  }, [selectedTicket])

  const adminUpdateImages = useMemo(() => {
    const hasRoleMetadata = attachments.some((a) => a?.uploadedBy?.role)
    if (!hasRoleMetadata) return attachments

    return attachments.filter((a) => {
      const role = String(a?.uploadedBy?.role || '').toUpperCase()
      return role === 'ADMIN' || role === 'SUPER_ADMIN'
    })
  }, [attachments])

  const hasAssignableStaff = technicians.length > 0 || securityOfficers.length > 0 || facilityManagers.length > 0
  const isAttachmentLimitReached = attachments.length >= 3

  return (
    <Layout>
      <PageTitle title="Browse Tickets" />
      <div className="space-y-6">
        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">My Tickets</h1>
              <p className="mt-1 text-sm text-stone-500">Create tickets, track status, and collaborate with comments and images.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
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
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center">
                <p className="text-[11px] uppercase tracking-wide text-red-600">Rejected</p>
                <p className="text-lg font-semibold text-red-700">{ticketStats.rejected}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-stone-900">Create ticket</h2>
          <form onSubmit={handleCreateTicket} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
              <select
                className="input-field"
                value={createForm.category}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))}
              >
                <option value="" disabled>Select category</option>
                <option value="FACILITY">Facility</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="NETWORK">Network</option>
                <option value="SECURITY">Security</option>
                <option value="OTHER">Other</option>
              </select>

              <select
                className="input-field"
                value={createForm.priority}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, priority: e.target.value }))}
              >
                <option value="" disabled>Select priority</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>

              <select
                className="input-field"
                value={createForm.resourceId}
                disabled={loadingResources}
                onChange={(e) => {
                  const nextResourceId = e.target.value
                  if (!nextResourceId) {
                    setCreateForm((prev) => ({ ...prev, resourceId: '', resourceOrLocation: '' }))
                    return
                  }

                  const selectedResource = resources.find((r) => String(r.id) === nextResourceId)
                  setCreateForm((prev) => ({
                    ...prev,
                    resourceId: nextResourceId,
                    resourceOrLocation: selectedResource
                      ? selectedResource.location
                      : prev.resourceOrLocation,
                  }))
                }}
              >
                <option value="">
                  {loadingResources ? 'Loading resources...' : 'Select resource'}
                </option>
                {!loadingResources && resourceLoadError && (
                  <option value="" disabled>
                    {resourceLoadError}
                  </option>
                )}
                {!loadingResources && !resourceLoadError && resources.length === 0 && (
                  <option value="" disabled>
                    No resources available
                  </option>
                )}
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name}
                  </option>
                ))}
              </select>

              {resourceLoadError && (
                <button
                  type="button"
                  className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
                  onClick={loadResources}
                >
                  Retry resources
                </button>
              )}

              <input
                type="file"
                accept="image/*"
                id="create-ticket-file"
                className="hidden"
                ref={createFileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  if (file) {
                    const fileError = validateFile(file)
                    if (fileError) {
                      toast.error(fileError)
                      e.target.value = ''
                      setCreateForm((prev) => ({ ...prev, file: null }))
                      return
                    }
                  }
                  setCreateForm((prev) => ({ ...prev, file }))
                }}
              />
              <div className="input-field flex items-center justify-between">
                <span className="truncate text-stone-500">{createForm.file?.name || 'Choose an image file'}</span>
                <button
                  type="button"
                  className="cursor-pointer rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700"
                  onClick={() => createFileInputRef.current?.click()}
                >
                  Browse
                </button>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create ticket'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                className="input-field"
                placeholder="Location"
                value={createForm.resourceOrLocation}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, resourceOrLocation: e.target.value }))}
              />
              <input
                className="input-field"
                placeholder="Preferred contact (optional)"
                value={createForm.preferredContact}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, preferredContact: e.target.value }))}
              />
            </div>

            <textarea
              rows={4}
              className="input-field"
              placeholder="Describe the issue in detail"
              value={createForm.description}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
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
                <option value="REJECTED">Rejected</option>
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
                  <div className="flex flex-wrap gap-2">
                    <span className={`badge ${STATUS_COLORS[selectedTicket.status] || 'bg-stone-100 text-stone-600'}`}>
                      {selectedTicket.status}
                    </span>
                    <span className={`badge ${PRIORITY_COLORS[selectedTicket.priority] || PRIORITY_COLORS.MEDIUM}`}>
                      {selectedTicket.priority || 'MEDIUM'}
                    </span>
                    {canManageTicket && !isEditingTicket && (
                      <>
                        <button
                          type="button"
                          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                          onClick={() => {
                            setIsEditingTicket(true)
                            setEditAttachmentFile(null)
                            setEditAttachmentFileName('No file chosen')
                            setEditRemovedAttachmentIds([])
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                          onClick={handleDeleteTicket}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditingTicket ? (
                  <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Edit ticket</p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <select
                        className="input-field"
                        value={editTicketForm.category}
                        onChange={(e) => setEditTicketForm((prev) => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="FACILITY">Facility</option>
                        <option value="ELECTRICAL">Electrical</option>
                        <option value="NETWORK">Network</option>
                        <option value="SECURITY">Security</option>
                        <option value="OTHER">Other</option>
                      </select>

                      <select
                        className="input-field"
                        value={editTicketForm.priority}
                        onChange={(e) => setEditTicketForm((prev) => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>

                      <select
                        className="input-field"
                        value={editTicketForm.resourceId}
                        onChange={(e) => {
                          const nextResourceId = e.target.value
                          if (!nextResourceId) {
                            setEditTicketForm((prev) => ({ ...prev, resourceId: '', resourceOrLocation: '' }))
                            return
                          }

                          const selectedResource = resources.find((r) => String(r.id) === nextResourceId)
                          setEditTicketForm((prev) => ({
                            ...prev,
                            resourceId: nextResourceId,
                            resourceOrLocation: selectedResource ? selectedResource.location : prev.resourceOrLocation,
                          }))
                        }}
                      >
                        <option value="">Select resource</option>
                        {resources.map((resource) => (
                          <option key={resource.id} value={resource.id}>{resource.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        className="input-field"
                        placeholder="Location"
                        value={editTicketForm.resourceOrLocation}
                        onChange={(e) => setEditTicketForm((prev) => ({ ...prev, resourceOrLocation: e.target.value }))}
                      />
                      <input
                        className="input-field"
                        placeholder="Preferred contact"
                        value={editTicketForm.preferredContact}
                        onChange={(e) => setEditTicketForm((prev) => ({ ...prev, preferredContact: e.target.value }))}
                      />
                    </div>
                    <textarea
                      rows={4}
                      className="input-field"
                      placeholder="Describe the issue in detail"
                      value={editTicketForm.description}
                      onChange={(e) => setEditTicketForm((prev) => ({ ...prev, description: e.target.value }))}
                    />

                    <div className="space-y-2 rounded-xl border border-stone-200 p-3">
                      <h3 className="text-sm font-semibold text-stone-800">Images / attachments</h3>
                      {attachments.length === 0 && (
                        <p className="text-sm text-stone-400">No attachments.</p>
                      )}
                      {attachments.length > 0 && (
                        <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
                          {attachments.map((a) => {
                            const src = `${API_BASE}/${a.filePath}`.replace(/([^:]\/)\/+/, '$1')
                            return (
                              <a
                                key={a.id}
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                className="block truncate text-sm text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {a.fileName}
                              </a>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button type="button" className="btn-secondary" onClick={handleSaveTicketEdit}>Save</button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setIsEditingTicket(false)
                          setEditAttachmentFile(null)
                          setEditAttachmentFileName('No file chosen')
                          setEditRemovedAttachmentIds([])
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
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
                      <p className="truncate text-sm font-medium text-stone-800">{selectedTicketAssignedLabel}</p>
                    </div>
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                      <p className="text-xs text-stone-500">Location</p>
                      <p className="truncate text-sm font-medium text-stone-800">{selectedTicket.resourceOrLocation || 'Not provided'}</p>
                    </div>
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                      <p className="text-xs text-stone-500">Linked resource</p>
                      <p className="truncate text-sm font-medium text-stone-800">{selectedTicketResourceLabel}</p>
                    </div>
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                      <p className="text-xs text-stone-500">Preferred contact</p>
                      <p className="truncate text-sm font-medium text-stone-800">{selectedTicket.preferredContact || 'Not provided'}</p>
                    </div>

                    <div className="col-span-2 rounded-xl border border-stone-200 p-3 md:col-span-3">
                      <h3 className="text-sm font-semibold text-stone-800">Images / attachments</h3>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={ticketAttachmentInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setTicketUploadFileName(file?.name || 'No file chosen')
                          handleUpload(file)
                        }}
                      />
                      <div className="mt-2 input-field flex items-center justify-between">
                        <span className="truncate text-stone-500">{ticketUploadFileName}</span>
                        <button
                          type="button"
                          className={`rounded-md px-2 py-1 text-xs font-medium ${isAttachmentLimitReached ? 'cursor-not-allowed bg-stone-200 text-stone-500' : 'bg-stone-100 text-stone-700'}`}
                          disabled={isAttachmentLimitReached}
                          onClick={() => ticketAttachmentInputRef.current?.click()}
                        >
                          Browse
                        </button>
                      </div>
                      {isAttachmentLimitReached && (
                        <p className="mt-1 text-xs text-red-600">Maximum 3 attachments reached for this ticket.</p>
                      )}
                      {attachments.length === 0 && (
                        <p className="mt-1 text-sm text-stone-400">No attachments.</p>
                      )}
                      {attachments.length > 0 && (
                        <div className="mt-1 max-h-32 space-y-1 overflow-y-auto pr-1">
                          {attachments.map((a) => {
                            const src = `${API_BASE}/${a.filePath}`.replace(/([^:]\/)\/+/, '$1')
                            const canDeleteAttachment =
                              isAdmin
                              || String(selectedTicket?.user?.id || '') === String(user?.id || '')
                              || String(a.uploadedBy?.id || '') === String(user?.id || '')
                            return (
                              <div key={a.id} className="flex items-center gap-2">
                                <a
                                  href={src}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="min-w-0 flex-1 truncate text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  {a.fileName}
                                </a>
                                {canDeleteAttachment && (
                                  <button
                                    type="button"
                                    className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-100"
                                    onClick={() => handleDeleteAttachment(a.id)}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="space-y-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Update status</p>
                      <div className="flex flex-wrap gap-2">
                        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`rounded-lg border px-3 py-2 text-xs font-medium ${adminStatusDraft === s ? 'border-slate-900 bg-slate-900 text-white' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}
                            onClick={() => setAdminStatusDraft(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <input
                      className="input-field"
                      placeholder="Reason (required for REJECTED)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Resolution notes</p>
                      <textarea
                        rows={3}
                        className="input-field"
                        placeholder="Add resolution notes"
                        value={resolutionDraft}
                        onChange={(e) => setResolutionDraft(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-stone-800">Add images</h3>
                      <input
                        type="file"
                        accept="image/*"
                        id="detail-upload-file"
                        className="hidden"
                        ref={detailFileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null
                          setAdminImageFile(file)
                          setDetailUploadFileName(file?.name || 'No file chosen')
                        }}
                      />
                      <div className="input-field flex items-center justify-between">
                        <span className="truncate text-stone-500">{detailUploadFileName}</span>
                        <button
                          type="button"
                          className={`rounded-md px-2 py-1 text-xs font-medium ${isAttachmentLimitReached ? 'cursor-not-allowed bg-stone-200 text-stone-500' : 'bg-stone-100 text-stone-700'}`}
                          disabled={isAttachmentLimitReached}
                          onClick={() => detailFileInputRef.current?.click()}
                        >
                          Browse
                        </button>
                      </div>
                      {isAttachmentLimitReached && (
                        <p className="text-xs text-red-600">Maximum 3 attachments reached for this ticket.</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button type="button" className="btn-secondary" onClick={handleAdminWorkflowSave}>
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {!isAdmin && (
                  <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Admin updates</p>
                    <div className="rounded-lg border border-stone-200 bg-white p-3">
                      <p className="text-xs text-stone-500">Status</p>
                      <p className="mt-1 text-sm font-medium text-stone-800">{selectedTicket.status}</p>
                    </div>
                    <div className="rounded-lg border border-stone-200 bg-white p-3">
                      <p className="text-xs text-stone-500">Resolution notes</p>
                      <p className="mt-1 text-sm text-stone-800 whitespace-pre-line">{selectedTicket.resolutionNotes || 'No resolution notes yet.'}</p>
                    </div>
                    <div className="rounded-lg border border-stone-200 bg-white p-3">
                      <p className="text-xs text-stone-500">Images</p>
                      {adminUpdateImages.length === 0 ? (
                        <p className="mt-1 text-sm text-stone-500">No images added in admin updates yet.</p>
                      ) : (
                        <div className="mt-1 space-y-1">
                          {adminUpdateImages.map((a) => {
                            const src = `${API_BASE}/${a.filePath}`.replace(/([^:]\/)\/+/, '$1')
                            return (
                              <a
                                key={`admin-update-image-${a.id}`}
                                href={src}
                                target="_blank"
                                rel="noreferrer"
                                className="block truncate text-sm text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {a.fileName}
                              </a>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedTicket.status === 'REJECTED' && selectedTicket.rejectionReason && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Rejection reason</p>
                    <p className="mt-1 text-sm text-red-800">{selectedTicket.rejectionReason}</p>
                  </div>
                )}

                {isAdmin && (
                  <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Assign staff</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <select className="input-field" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                        <option value="">Select staff member</option>
                        <optgroup label="Technician">
                          {technicians.length > 0 ? technicians.map((u) => (
                            <option key={`tech-${u.id}`} value={u.id}>{u.displayName || u.email}</option>
                          )) : (
                            <option disabled value="">No technicians available</option>
                          )}
                        </optgroup>
                        <optgroup label="Security Officer">
                          {securityOfficers.length > 0 ? securityOfficers.map((u) => (
                            <option key={`sec-${u.id}`} value={u.id}>{u.displayName || u.email}</option>
                          )) : (
                            <option disabled value="">No security officers available</option>
                          )}
                        </optgroup>
                        <optgroup label="Facility Manager">
                          {facilityManagers.length > 0 ? facilityManagers.map((u) => (
                            <option key={`fm-${u.id}`} value={u.id}>{u.displayName || u.email}</option>
                          )) : (
                            <option disabled value="">No facility managers available</option>
                          )}
                        </optgroup>
                      </select>
                      <button className="btn-secondary" onClick={handleAssign} disabled={!assigneeId}>Assign</button>
                    </div>
                    {!hasAssignableStaff && (
                      <p className="text-xs text-stone-500">
                        No assignable staff found. Set a user role to Technician, Security Officer, or Facility Manager in Users page.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2 rounded-xl border border-stone-200 p-3">
                    <h3 className="text-sm font-semibold text-stone-800">Comments</h3>
                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                      {comments.length === 0 && <p className="text-sm text-stone-400">No comments yet.</p>}
                      {comments.map((c) => (
                        <div key={c.id} className="rounded-lg bg-stone-50 p-2.5">
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-stone-500">{c.author?.displayName || c.author?.email || 'User'}</p>
                            {(() => {
                              const role = String(c.author?.role || 'USER').trim().toUpperCase()
                              return (
                                <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${getRoleBadgeClass(role)}`}>
                                  {getRoleLabel(role)}
                                </span>
                              )
                            })()}
                          </div>
                          {editingCommentId === c.id ? (
                            <div className="mt-1 space-y-2">
                              <input
                                className="input-field"
                                value={editingCommentText}
                                onChange={(e) => setEditingCommentText(e.target.value)}
                              />
                              <div className="flex gap-2">
                                <button className="btn-secondary" onClick={handleEditComment}>Save</button>
                                <button className="btn-secondary" onClick={cancelEditComment}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-0.5 text-sm text-stone-800">{c.content}</p>
                          )}

                          {(isAdmin || String(c.author?.id || '') === String(user?.id || '')) && editingCommentId !== c.id && (
                            <div className="mt-2 flex gap-2">
                              <button className="text-xs font-medium text-blue-700 hover:underline" onClick={() => startEditComment(c)}>
                                Edit
                              </button>
                              <button className="text-xs font-medium text-red-700 hover:underline" onClick={() => handleDeleteComment(c.id)}>
                                Delete
                              </button>
                            </div>
                          )}
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
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default TicketsPage
