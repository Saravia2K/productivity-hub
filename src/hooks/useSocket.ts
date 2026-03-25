import { useEffect } from 'react'
import { getSocket } from '#/lib/socket'
import { useNotificationStore } from '#/stores/notification.store'
import type { Notification } from '#/types'

/** Subscribes to real-time events and feeds them into the notification store. */
export function useSocket() {
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    const socket = getSocket()

    const handleNotification = (notification: Notification) => {
      addNotification(notification)
    }

    socket.on('notification', handleNotification)

    return () => {
      socket.off('notification', handleNotification)
    }
  }, [addNotification])
}
