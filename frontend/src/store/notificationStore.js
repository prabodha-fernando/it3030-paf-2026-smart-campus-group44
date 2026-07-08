import { create } from 'zustand'

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount:   0,
  isOpen:        false,

  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount:   (unreadCount)   => set({ unreadCount }),
  toggleDrawer:     ()              => set((s) => ({ isOpen: !s.isOpen })),
  closeDrawer:      ()              => set({ isOpen: false }),

  addNotification: (notification) => set((s) => ({
    notifications: [notification, ...s.notifications],
    unreadCount:   s.unreadCount + 1,
  })),

  markOneRead: (id) => set((s) => ({
    notifications: s.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, s.unreadCount - 1),
  })),

  markAllRead: () => set((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, read: true })),
    unreadCount:   0,
  })),

  removeNotification: (id) => set((s) => ({
    notifications: s.notifications.filter((n) => n.id !== id),
    unreadCount: s.notifications.find((n) => n.id === id && !n.read)
      ? Math.max(0, s.unreadCount - 1)
      : s.unreadCount,
  })),
}))

export default useNotificationStore