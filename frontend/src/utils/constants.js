export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
export const WS_URL   = import.meta.env.VITE_WS_URL       || 'http://localhost:8080/ws'

export const ROLES = {
  SUPER_ADMIN:      'SUPER_ADMIN',
  ADMIN:            'ADMIN',
  HOD:              'HOD',
  FACILITY_MANAGER: 'FACILITY_MANAGER',
  SECURITY_OFFICER: 'SECURITY_OFFICER',
  LECTURER:         'LECTURER',
  TECHNICIAN:       'TECHNICIAN',
  STUDENT:          'STUDENT',
  USER:             'USER',
}

export const ROLE_LABELS = {
  SUPER_ADMIN:      'Super Admin',
  ADMIN:            'Admin',
  HOD:              'Head of Dept.',
  FACILITY_MANAGER: 'Facility Manager',
  SECURITY_OFFICER: 'Security Officer',
  LECTURER:         'Lecturer',
  TECHNICIAN:       'Technician',
  STUDENT:          'Student',
  USER:             'User',
}

export const NOTIF_PRIORITY_COLORS = {
  LOW:    'bg-stone-100 text-stone-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH:   'bg-accent-100 text-accent-800',
  URGENT: 'bg-red-100 text-red-700',
}

export const NOTIF_CATEGORY_LABELS = {
  BOOKING:      'Booking',
  TICKET:       'Ticket',
  COMMENT:      'Comment',
  ROLE_REQUEST: 'Role',
  SYSTEM:       'System',
}

export const BOOKING_STATUS_COLORS = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  APPROVED:  'bg-green-100 text-green-800',
  REJECTED:  'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-700',
}

export const TICKET_STATUS_COLORS = {
  OPEN:        'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-accent-100 text-accent-800',
  RESOLVED:    'bg-primary-100 text-primary-800',
  CLOSED:      'bg-stone-100 text-stone-600',
  REJECTED:    'bg-red-100 text-red-700',
}