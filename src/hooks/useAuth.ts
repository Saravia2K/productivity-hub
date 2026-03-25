import { useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useAuthStore } from '#/stores/auth.store'
import { authService } from '#/services/auth.service'
import { connectSocket, disconnectSocket } from '#/lib/socket'
import type { LoginDto, RegisterDto } from '#/types'

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore()
  const router = useRouter()

  const login = useCallback(
    async (dto: LoginDto) => {
      const response = await authService.login(dto)
      setAuth(response.user, response.tokens)
      connectSocket(response.tokens.accessToken)
      await router.navigate({ to: '/dashboard' })
    },
    [setAuth, router],
  )

  const register = useCallback(
    async (dto: RegisterDto) => {
      const response = await authService.register(dto)
      setAuth(response.user, response.tokens)
      connectSocket(response.tokens.accessToken)
      await router.navigate({ to: '/dashboard' })
    },
    [setAuth, router],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      disconnectSocket()
      clearAuth()
      await router.navigate({ to: '/login' })
    }
  }, [clearAuth, router])

  return { user, isAuthenticated, login, register, logout }
}
