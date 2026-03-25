import apiClient from '#/lib/axios'
import type { DashboardMetrics, PaginatedResponse, User, UserRole } from '#/types'

export const userService = {
  getAll: (params: { cursor?: string; limit?: number } = {}) =>
    apiClient
      .get<PaginatedResponse<User>>('/users', { params })
      .then((r) => r.data),

  getById: (id: string) => apiClient.get<User>(`/users/${id}`).then((r) => r.data),

  updateRole: (id: string, role: UserRole) =>
    apiClient.patch<User>(`/users/${id}/role`, { role }).then((r) => r.data),

  getDashboardMetrics: () =>
    apiClient.get<DashboardMetrics>('/dashboard/metrics').then((r) => r.data),
}
