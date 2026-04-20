import { useState } from 'react'
import { submitRoleRequest } from '../../api/authApi'
import { ROLES, ROLE_LABELS } from '../../utils/constants'
import useAuth from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const REQUESTABLE_ROLES = [
  ROLES.LECTURER, ROLES.TECHNICIAN, ROLES.HOD,
  ROLES.FACILITY_MANAGER, ROLES.SECURITY_OFFICER,
]

const RoleRequestModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth()
  const [requestedRole,  setRequestedRole]  = useState('')
  const [justification, setJustification] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (justification.length < 20) {
      toast.error('Justification must be at least 20 characters')
      return
    }
    setLoading(true)
    try {
      await submitRoleRequest({ requestedRole, justification })
      toast.success('Role request submitted successfully')
      onSuccess?.()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit request'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-fade-in">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Request role upgrade</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="p-3 bg-stone-50 rounded-lg flex items-center gap-3">
            <span className="text-sm text-stone-500">Current role</span>
            <span className="badge bg-stone-200 text-stone-700">{ROLE_LABELS[user?.role]}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Requested role
            </label>
            <select
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value)}
              required
              className="input-field"
            >
              <option value="">Select a role...</option>
              {REQUESTABLE_ROLES.filter(r => r !== user?.role).map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Justification
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              required
              rows={4}
              placeholder="Explain why you need this role (minimum 20 characters)..."
              className="input-field resize-none"
            />
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${justification.length < 20 ? 'text-red-500' : 'text-stone-400'}`}>
                Minimum 20 characters
              </span>
              <span className="text-xs text-stone-400">{justification.length}/500</span>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : 'Submit request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RoleRequestModal