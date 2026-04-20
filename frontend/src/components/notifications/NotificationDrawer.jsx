import { useState } from 'react'
import useNotificationStore from '../../store/notificationStore'
import useNotifications from '../../hooks/useNotifications'
import NotificationItem from './NotificationItem'

const TABS = ['All', 'Unread', 'Bookings', 'Tickets', 'Comments']

const NotificationDrawer = () => {
  const { isOpen, closeDrawer } = useNotificationStore()
  const { notifications, unreadCount, handleMarkAsRead, handleMarkAllAsRead, handleDelete } = useNotifications()
  const [activeTab, setActiveTab] = useState('All')

  const filtered = notifications.filter((n) => {
    const category = n.category?.toUpperCase() || ''
    if (activeTab === 'All')      return true
    if (activeTab === 'Unread')   return !n.read
    if (activeTab === 'Bookings') return category === 'BOOKING'
    if (activeTab === 'Tickets')  return category === 'TICKET'
    if (activeTab === 'Comments') return category === 'COMMENT'
    return true
  })

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={closeDrawer} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col animate-slide-in">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <h2 className="font-semibold text-stone-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="badge bg-accent-600 text-white text-[10px]">{unreadCount}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Mark all read
              </button>
            )}
            <button onClick={closeDrawer} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 px-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-400">
              <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            filtered.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default NotificationDrawer