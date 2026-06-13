import { useState, useEffect } from 'react'
import { getMyBookings, getBookingsPendingApproval } from '../api/bookingApi'
import { getMyTickets, getOpenTickets } from '../api/ticketApi'
import { getUnreadCount } from '../api/notificationApi'

const useDashboardStats = () => {
  const [stats, setStats] = useState({
    myBookings: 0,
    pendingApproval: 0,
    openTickets: 0,
    notifications: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all stats in parallel
      const [bookingsRes, pendingRes, , openTicketsRes, notificationsRes] = await Promise.allSettled([
        getMyBookings({ size: 1 }), // Just get count
        getBookingsPendingApproval({ size: 1 }),
        getMyTickets({ size: 1 }),
        getOpenTickets({ size: 1 }),
        getUnreadCount()
      ])

      setStats({
        myBookings: bookingsRes.status === 'fulfilled' ? bookingsRes.value.data.totalElements || 0 : 0,
        pendingApproval: pendingRes.status === 'fulfilled' ? pendingRes.value.data.totalElements || 0 : 0,
        openTickets: openTicketsRes.status === 'fulfilled' ? openTicketsRes.value.data.totalElements || 0 : 0,
        notifications: notificationsRes.status === 'fulfilled' ? (notificationsRes.value.data?.count ?? 0) : 0
      })
    } catch (err) {
      setError(err.message)
      console.error('Error fetching dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}

export default useDashboardStats