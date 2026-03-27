import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'
import { useAuthStore } from '#/stores/auth.store'
import { connectSocket } from '#/lib/socket'
import apiClient from '#/lib/axios'
import type { AuthResponse } from '#/types'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (!code) {
      setError('No se recibió el código de autorización de Google.')
      return
    }

    apiClient
      .post<AuthResponse>('/auth/google/callback', { code })
      .then(({ data }) => {
        setAuth(data.user, data.tokens)
        connectSocket(data.tokens.accessToken)
        void navigate({ to: '/dashboard' })
      })
      .catch(() => {
        setError('No se pudo completar el inicio de sesión con Google.')
      })
  }, [navigate, setAuth])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
      <div className="space-y-4 text-center">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-gradient-to-br from-[var(--lagoon)] to-[var(--lagoon-deep)]">
          <Zap className="h-6 w-6 text-white" />
        </div>
        {error ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-600">{error}</p>
            <a
              href="/login"
              className="text-sm text-[var(--lagoon-deep)] underline hover:opacity-80"
            >
              Volver al inicio de sesión
            </a>
          </div>
        ) : (
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Completando inicio de sesión…
          </p>
        )}
      </div>
    </div>
  )
}
