import apiClient from '#/lib/axios'
import type { AuthResponse, LoginDto, RegisterDto, User } from '#/types'

export const authService = {
  login: (dto: LoginDto) =>
    apiClient.post<AuthResponse>('/auth/login', dto).then((r) => r.data),

  register: (dto: RegisterDto) =>
    apiClient.post<AuthResponse>('/auth/register', dto).then((r) => r.data),

  logout: () => apiClient.post('/auth/logout').then((r) => r.data),

  getMe: () => apiClient.get<User>('/auth/me').then((r) => r.data),

  updateProfile: (data: Partial<Pick<User, 'name' | 'bio' | 'department' | 'avatar'>>) =>
    apiClient.patch<User>('/auth/me', data).then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient
      .patch('/auth/me/password', { currentPassword, newPassword })
      .then((r) => r.data),

  googleAuth: async () => {
    const { data } = await apiClient.get<{ url: string }>('/auth/google')
    window.location.href = data.url
  },
}
