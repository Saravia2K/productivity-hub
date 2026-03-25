import apiClient from '#/lib/axios'
import type {
  CreateObjectiveDto,
  Objective,
  ObjectiveComment,
  ObjectiveStatus,
  PaginatedResponse,
  SubTask,
} from '#/types'

export const objectiveService = {
  getAll: (params: { cursor?: string; limit?: number } = {}) =>
    apiClient
      .get<PaginatedResponse<Objective>>('/objectives', { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Objective>(`/objectives/${id}`).then((r) => r.data),

  create: (dto: CreateObjectiveDto) =>
    apiClient.post<Objective>('/objectives', dto).then((r) => r.data),

  update: (id: string, data: Partial<CreateObjectiveDto>) =>
    apiClient.patch<Objective>(`/objectives/${id}`, data).then((r) => r.data),

  updateStatus: (id: string, status: ObjectiveStatus) =>
    apiClient
      .patch<Objective>(`/objectives/${id}/status`, { status })
      .then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/objectives/${id}`).then((r) => r.data),

  addComment: (id: string, content: string) =>
    apiClient
      .post<ObjectiveComment>(`/objectives/${id}/comments`, { content })
      .then((r) => r.data),

  toggleSubTask: (id: string, subTaskId: string) =>
    apiClient
      .patch<SubTask>(`/objectives/${id}/subtasks/${subTaskId}/toggle`)
      .then((r) => r.data),
}
