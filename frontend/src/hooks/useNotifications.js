import { useEffect } from 'react'
import useNotificationStore from '../store/notificationStore'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../api/notificationApi'

const useNotifications = () => {
  const store = useNotificationStore()

  useEffect(() => {
    const load = async () => {
      try {
        const [notifRes, countRes] = await Promise.all([
          getNotifications({ page: 0, size: 20 }),
          getUnreadCount(),
        ])
        store.setNotifications(notifRes.data.content || [])
        store.setUnreadCount(countRes.data || 0)
      } catch { /* silent */ }
    }
    load()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      store.markOneRead(id)
    } catch { /* silent */ }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      store.markAllRead()
    } catch { /* silent */ }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      store.removeNotification(id)
    } catch { /* silent */ }
  }

  return {
    ...store,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
  }
}

export default useNotifications