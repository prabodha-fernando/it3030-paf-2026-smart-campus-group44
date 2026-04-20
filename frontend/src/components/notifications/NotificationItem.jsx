import { formatDistanceToNow } from 'date-fns'
import { NOTIF_CATEGORY_LABELS, NOTIF_PRIORITY_COLORS } from '../../utils/constants'

const dotColors = {
  LOW:    'bg-stone-400',
  MEDIUM: 'bg-blue-500',
  HIGH:   'bg-accent-600',
  URGENT: 'bg-red-500 animate-pulse-dot',
}

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const timeAgo = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
    : ''

  return (
    <div
      className={`px-4 py-3 hover:bg-stone-50 transition-colors cursor-pointer border-b border-stone-100 last:border-0 ${
        !notification.read ? 'bg-primary-50/40' : ''
      }`}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <div className="flex gap-3 items-start">
        <div className="mt-1.5 flex-shrink-0">
          <span className={`w-2 h-2 rounded-full block ${dotColors[notification.priority] || 'bg-stone-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm leading-snug ${!notification.read ? 'font-medium text-stone-900' : 'text-stone-700'}`}>
              {notification.title}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(notification.id) }}
              className="text-stone-300 hover:text-stone-500 flex-shrink-0 mt-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{notification.message}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`badge text-[10px] ${NOTIF_PRIORITY_COLORS[notification.priority]}`}>
              {NOTIF_CATEGORY_LABELS[notification.category]}
            </span>
            <span className="text-[11px] text-stone-400">{timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationItem