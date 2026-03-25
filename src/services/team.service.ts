import apiClient from '#/lib/axios'
import type { ChatMessage, PaginatedResponse, Team } from '#/types'

export const teamService = {
  getAll: () => apiClient.get<Team[]>('/teams').then((r) => r.data),

  getById: (id: string) => apiClient.get<Team>(`/teams/${id}`).then((r) => r.data),

  create: (data: { name: string; description?: string }) =>
    apiClient.post<Team>('/teams', data).then((r) => r.data),

  update: (id: string, data: { name?: string; description?: string }) =>
    apiClient.patch<Team>(`/teams/${id}`, data).then((r) => r.data),

  addMember: (id: string, userId: string) =>
    apiClient.post<Team>(`/teams/${id}/members`, { userId }).then((r) => r.data),

  removeMember: (id: string, userId: string) =>
    apiClient.delete<Team>(`/teams/${id}/members/${userId}`).then((r) => r.data),

  getChatMessages: (id: string, params: { cursor?: string; limit?: number } = {}) =>
    apiClient
      .get<PaginatedResponse<ChatMessage>>(`/teams/${id}/chat`, { params })
      .then((r) => r.data),

  sendChatMessage: (id: string, content: string) =>
    apiClient
      .post<ChatMessage>(`/teams/${id}/chat`, { content })
      .then((r) => r.data),
}
