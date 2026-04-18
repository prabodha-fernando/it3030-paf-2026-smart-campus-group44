import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { getMyProfile, updateMyProfile, getRoleRequests, cancelRoleRequest } from '../api/authApi'
import { getPreferences, updatePreferences } from '../api/notificationApi'
import Layout from '../components/common/Layout'
import RoleRequestModal from '../components/auth/RoleRequestModal'
import { getRoleBadgeClass, getRoleLabel, getInitials } from '../utils/roleUtils'
import { ROLE_LABELS } from '../utils/constants'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [pendingRequest, setPendingRequest] = useState(null)
  const [prefs, setPrefs] = useState(null)
  const [fullProfile, setFullProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)

  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    department:  user?.department  || '',
    phone:       user?.phone       || '',
  })

  useEffect(() => {
    if (user) setForm({ displayName: user.displayName || '', department: user.department || '', phone: user.phone || '' })
  }, [user])

  useEffect(() => {
    setAvatarLoadFailed(false)
  }, [user?.photoUrl])

  useEffect(() => {
    getMyProfile().then(({ data }) => {
    setFullProfile(data)
    setForm({ displayName: data.displayName || '', department: data.department || '', phone: data.phone || '' })
  }).catch(() => {})

    getRoleRequests({ status: 'PENDING' })
      .then(({ data }) => { if (data.length > 0) setPendingRequest(data[0]) })
      .catch(() => {})

    getPreferences()
      .then(({ data }) => setPrefs(data))
      .catch(() => {})
  }, [])

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
       const { data } = await updateMyProfile(form)
       setFullProfile(data)
       setEditing(false)
       toast.success('Profile updated')
      } catch { toast.error('Failed to update profile') }
      finally { setLoading(false) }
    }

  const handleSavePrefs = async () => {
    setLoading(true)
    try {
      await updatePreferences(prefs)
      toast.success('Preferences saved')
    } catch { toast.error('Failed to save preferences') }
    finally { setLoading(false) }
  }

  const handleCancelRoleRequest = async () => {
    try {
      await cancelRoleRequest(pendingRequest.id)
      setPendingRequest(null)
      toast.success('Role request cancelled')
    } catch { toast.error('Failed to cancel request') }
  }

  const completeness = [user?.displayName, user?.department, user?.phone, user?.photoUrl]
    .filter(Boolean).length / 4 * 100

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Profile header card */}
        <div className="card">
          <div className="flex items-start gap-4">
            {user?.photoUrl && !avatarLoadFailed ? (
              <img
                src={user.photoUrl}
                alt=""
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-primary-100"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-primary-600 flex items-center justify-center text-white text-xl font-semibold">
                {getInitials(user?.displayName)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-lg font-semibold text-stone-900">{user?.displayName}</h1>
                  <p className="text-sm text-stone-500">{user?.email}</p>
                </div>
                <span className={`badge ${getRoleBadgeClass(user?.role)}`}>
                  {getRoleLabel(user?.role)}
                </span>
              </div>

              {/* Profile completeness */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>Profile completeness</span>
                  <span>{Math.round(completeness)}%</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${completeness}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 gap-1">
          {['profile', 'notifications', 'role'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}>
              {tab === 'role' ? 'Role' : tab === 'notifications' ? 'Notifications' : 'Profile'}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-stone-900">Personal information</h2>
              {!editing && (
                <button onClick={() => setEditing(true)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Display name</label>
                  <input type="text" value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Department</label>
                  <input type="text" value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone</label>
                  <input type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-field" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
                  <button onClick={handleSaveProfile} disabled={loading} className="btn-primary">
                    {loading ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Email',      value: fullProfile?.email      },
                  { label: 'Department', value: fullProfile?.department },
                  { label: 'Phone',      value: fullProfile?.phone      },
                  { label: 'Last login', value: fullProfile?.lastLoginAt ? new Date(fullProfile.lastLoginAt).toLocaleDateString() : null },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-stone-50 last:border-0">
                    <span className="text-sm text-stone-500">{row.label}</span>
                    <span className="text-sm text-stone-900">{row.value || <span className="text-stone-300">Not set</span>}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications tab */}
        {activeTab === 'notifications' && prefs && (
          <div className="card space-y-4">
            <h2 className="font-medium text-stone-900">Notification preferences</h2>

            <div className="space-y-2">
              {[
                { key: 'bookingUpdates',     label: 'Booking updates',  desc: 'Approvals and rejections' },
                { key: 'ticketUpdates',      label: 'Ticket updates',   desc: 'Status changes on your tickets' },
                { key: 'commentAlerts',      label: 'New comments',     desc: 'Comments on your tickets' },
                { key: 'roleRequestUpdates', label: 'Role requests',    desc: 'Role upgrade decisions' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{item.label}</p>
                    <p className="text-xs text-stone-500">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setPrefs({ ...prefs, [item.key]: !prefs[item.key] })}
                    style={{ minWidth: '40px', height: '22px' }}
                    className={`relative rounded-full transition-colors flex items-center ${
                      prefs[item.key] ? 'bg-primary-600' : 'bg-stone-200'
                    }`}
                  >
                    <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      prefs[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={handleSavePrefs} disabled={loading} className="btn-primary w-full">
              {loading ? 'Saving...' : 'Save preferences'}
            </button>
          </div>
        )}

        {/* Role tab */}
        {activeTab === 'role' && (
          <div className="card space-y-4">
            <h2 className="font-medium text-stone-900">Role management</h2>

            <div className="p-4 bg-stone-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-400 mb-1">Current role</p>
                <span className={`badge ${getRoleBadgeClass(user?.role)}`}>
                  {getRoleLabel(user?.role)}
                </span>
              </div>
            </div>

            {pendingRequest ? (
              <div className="p-4 bg-accent-50 border border-accent-200 rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-accent-900">Pending request</p>
                    <p className="text-xs text-accent-700 mt-0.5">
                      Upgrade to {ROLE_LABELS[pendingRequest.requestedRole]} — under review
                    </p>
                  </div>
                  <button onClick={handleCancelRoleRequest}
                    className="text-xs text-red-600 hover:text-red-700 font-medium">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowRoleModal(true)} className="btn-secondary w-full">
                Request role upgrade
              </button>
            )}
          </div>
        )}
      </div>

      {showRoleModal && (
        <RoleRequestModal
          onClose={() => setShowRoleModal(false)}
          onSuccess={() => getRoleRequests({ status: 'PENDING' })
            .then(({ data }) => setPendingRequest(data[0] || null)).catch(() => {})}
        />
      )}
    </Layout>
  )
}

export default ProfilePage