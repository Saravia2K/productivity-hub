import { create } from 'zustand'
import type { Notification } from '#/types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),

  addNotification: (notification) => {
    const notifications = [notification, ...get().notifications]
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    })
  },

  markAsRead: (id) => {
    const notifications = get().notifications.map((n) =>
      n._id === id ? { ...n, read: true } : n,
    )
    set({ notifications, unreadCount: notifications.filter((n) => !n.read).length })
  },

  markAllAsRead: () => {
    const notifications = get().notifications.map((n) => ({ ...n, read: true }))
    set({ notifications, unreadCount: 0 })
  },
}))
