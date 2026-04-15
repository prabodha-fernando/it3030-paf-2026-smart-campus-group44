import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { WS_URL } from '../utils/constants'
import useNotificationStore from '../store/notificationStore'

const useWebSocket = (userEmail) => {
  const clientRef = useRef(null)
  const addNotification = useNotificationStore((s) => s.addNotification)

  useEffect(() => {
    if (!userEmail) return

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      onConnect: () => {
        client.subscribe(`/user/${userEmail}/queue/notifications`, (msg) => {
          try {
            const notification = JSON.parse(msg.body)
            addNotification(notification)
          } catch { /* ignore */ }
        })
      },
      reconnectDelay: 5000,
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [userEmail, addNotification])

  return clientRef
}

export default useWebSocket