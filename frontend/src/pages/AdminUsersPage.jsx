import { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import { getAllUsers, changeUserRole, getRoleRequests, processRoleRequest } from '../api/authApi'
import { getRoleBadgeClass, getRoleLabel, getInitials } from '../utils/roleUtils'
import { ROLES, ROLE_LABELS } from '../utils/constants'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const TABS = ['Users', 'Role requests']

const AdminUsersPage = () => {
  const [activeTab,    setActiveTab]    = useState('Users')
  const [users,        setUsers]        = useState([])
  const [requests,     setRequests]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [searchQuery,  setSearchQuery]  = useState('')
  const [roleFilter,   setRoleFilter]   = useState('')
  const [adminNote,    setAdminNote]    = useState({})
  const [processingId, setProcessingId] = useState(null)

  const loadUsers = async () => {
    try {
      const { data } = await getAllUsers({ role: roleFilter || undefined, page: 0, size: 50 })
      setUsers(data)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }

  const loadRequests = async () => {
    try {
      const { data } = await getRoleRequests()
      setRequests(data)
    } catch { /* silent */ }
  }

  useEffect(() => { loadUsers(); loadRequests() }, [roleFilter])

  const handleChangeRole = async (userId, role) => {
    try {
      await changeUserRole(userId, role)
      await loadUsers()
      toast.success('Role updated')
    } catch { toast.error('Failed to change role') }
  }

  const handleProcessRequest = async (id, status) => {
    setProcessingId(id)
    try {
      await processRoleRequest(id, { status, adminNote: adminNote[id] || '' })
      await loadRequests()
      await loadUsers()
      toast.success(`Request ${status.toLowerCase()}`)
    } catch { toast.error('Failed to process request') }
    finally { setProcessingId(null) }
  }

  const filtered = users.filter((u) =>
    !searchQuery ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-5">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">User management</h1>
            <p className="text-sm text-stone-500 mt-0.5">Manage roles and review upgrade requests</p>
          </div>
          <span className="badge bg-stone-100 text-stone-600">{users.length} users</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors relative ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}>
              {tab}
              {tab === 'Role requests' && requests.filter(r => r.status === 'PENDING').length > 0 && (
                <span className="ml-2 badge bg-accent-600 text-white text-[10px]">
                  {requests.filter(r => r.status === 'PENDING').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {activeTab === 'Users' && (
          <div className="card p-0 overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-stone-100 flex gap-3">
              <div className="flex-1 relative">
                <svg className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="input-field pl-9" />
              </div>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                className="input-field w-40">
                <option value="">All roles</option>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {loading ? <LoadingSpinner /> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50 border-b border-stone-100">
                    <tr>
                      <th className="text-left text-xs font-medium text-stone-500 px-4 py-3">User</th>
                      <th className="text-left text-xs font-medium text-stone-500 px-4 py-3">Department</th>
                      <th className="text-left text-xs font-medium text-stone-500 px-4 py-3">Role</th>
                      <th className="text-left text-xs font-medium text-stone-500 px-4 py-3">Last login</th>
                      <th className="text-left text-xs font-medium text-stone-500 px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {u.photoUrl ? (
                              <img src={u.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                                {getInitials(u.displayName)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-stone-900">{u.displayName || '—'}</p>
                              <p className="text-xs text-stone-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-600">{u.department || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${getRoleBadgeClass(u.role)}`}>{getRoleLabel(u.role)}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-stone-400">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 text-stone-700 bg-white focus:ring-1 focus:ring-primary-500"
                          >
                            {Object.entries(ROLE_LABELS).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-stone-400 text-sm">No users found</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Role requests tab */}
        {activeTab === 'Role requests' && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="card text-center py-12 text-stone-400 text-sm">
                No role requests
              </div>
            ) : requests.map((req) => (
              <div key={req.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {getInitials(req.userDisplayName)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">{req.userDisplayName}</p>
                      <p className="text-xs text-stone-400">{req.userEmail}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`badge text-[10px] ${getRoleBadgeClass(req.currentRole)}`}>
                          {getRoleLabel(req.currentRole)}
                        </span>
                        <svg className="w-3 h-3 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className={`badge text-[10px] ${getRoleBadgeClass(req.requestedRole)}`}>
                          {getRoleLabel(req.requestedRole)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`badge text-[10px] flex-shrink-0 ${
                    req.status === 'PENDING'  ? 'bg-accent-100 text-accent-800' :
                    req.status === 'APPROVED' ? 'bg-primary-100 text-primary-800' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="mt-3 p-3 bg-stone-50 rounded-lg">
                  <p className="text-xs text-stone-500 font-medium mb-1">Justification</p>
                  <p className="text-sm text-stone-700">{req.justification}</p>
                </div>

                {req.status === 'PENDING' && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      placeholder="Admin note (optional for approval, recommended for rejection)"
                      value={adminNote[req.id] || ''}
                      onChange={(e) => setAdminNote({ ...adminNote, [req.id]: e.target.value })}
                      className="input-field text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleProcessRequest(req.id, 'APPROVED')}
                        disabled={processingId === req.id}
                        className="btn-primary text-sm py-2 flex-1"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleProcessRequest(req.id, 'REJECTED')}
                        disabled={processingId === req.id}
                        className="btn-danger text-sm py-2 flex-1"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminUsersPage