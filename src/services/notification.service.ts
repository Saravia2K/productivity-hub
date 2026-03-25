import apiClient from '#/lib/axios'
import type { Notification, PaginatedResponse } from '#/types'

export const notificationService = {
  getAll: (params: { cursor?: string; limit?: number } = {}) =>
    apiClient
      .get<PaginatedResponse<Notification>>('/notifications', { params })
      .then((r) => r.data),

  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    apiClient.patch('/notifications/read-all').then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/notifications/${id}`).then((r) => r.data),
}
