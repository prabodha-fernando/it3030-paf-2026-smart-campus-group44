import { ROLES, ROLE_LABELS } from './constants'

export const getRoleLabel = (role) => ROLE_LABELS[role] || role

export const getRoleBadgeClass = (role) => {
  const map = {
    SUPER_ADMIN:      'bg-slate-900 text-primary-400',
    ADMIN:            'bg-slate-800 text-slate-300',
    HOD:              'bg-primary-900 text-primary-300',
    FACILITY_MANAGER: 'bg-primary-100 text-primary-800',
    SECURITY_OFFICER: 'bg-red-100 text-red-700',
    LECTURER:         'bg-accent-100 text-accent-800',
    TECHNICIAN:       'bg-yellow-100 text-yellow-800',
    STUDENT:          'bg-blue-100 text-blue-700',
    USER:             'bg-stone-100 text-stone-600',
  }
  return map[role] || 'bg-stone-100 text-stone-600'
}

export const isAdmin = (role) =>
  [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role)

export const canApproveBookings = (role) =>
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HOD, ROLES.FACILITY_MANAGER].includes(role)

export const canManageTickets = (role) =>
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECHNICIAN, ROLES.SECURITY_OFFICER].includes(role)

export const getInitials = (name) => {
  if (!name) return 'SC'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}