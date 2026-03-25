import apiClient from '#/lib/axios'
import type { CreateFeedbackDto, Feedback, PaginatedResponse } from '#/types'

export interface FeedbackFilters {
  type?: string
  category?: string
  cursor?: string
  limit?: number
}

export const feedbackService = {
  getReceived: (filters: FeedbackFilters = {}) =>
    apiClient
      .get<PaginatedResponse<Feedback>>('/feedback/received', { params: filters })
      .then((r) => r.data),

  getSent: (filters: FeedbackFilters = {}) =>
    apiClient
      .get<PaginatedResponse<Feedback>>('/feedback/sent', { params: filters })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Feedback>(`/feedback/${id}`).then((r) => r.data),

  create: (dto: CreateFeedbackDto) =>
    apiClient.post<Feedback>('/feedback', dto).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/feedback/${id}`).then((r) => r.data),
}
