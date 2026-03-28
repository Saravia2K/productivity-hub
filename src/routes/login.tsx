import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Zap, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '#/hooks/useAuth'
import { authService } from '#/services/auth.service'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

export const Route = createFileRoute('/login')({
  component: LoginGuard,
})

function LoginGuard() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  if (token) return <Navigate to="/dashboard" replace />
  return <LoginPage />
}

function LoginPage() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string; password: string }>()

  async function onSubmit(data: { email: string; password: string }) {
    setServerError('')
    try {
      await login({ email: data.email, password: data.password })
    } catch {
      setServerError('Credenciales incorrectas. Verifica tu email y contraseña.')
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-linear-to-br from-[#0e2428] to-[#061014] p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(31,151,144,0.18),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(21,90,48,0.2),transparent_66%)]" />

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-(--lagoon) to-(--lagoon-deep)">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">TeamSync</span>
        </div>

        {/* Hero copy */}
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-(--lagoon)">
              Feedback Hub
            </p>
            <h2 className="text-4xl font-bold leading-tight text-white">
              Impulsa el crecimiento de tu equipo con feedback continuo
            </h2>
            <p className="text-base text-white/60 leading-relaxed">
              Ciclos de feedback 360°, objetivos con Kanban y colaboración en tiempo real para equipos remotos de alto rendimiento.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {[
              'Feedback 360° con categorías y anonimato',
              'Tablero Kanban con drag & drop en tiempo real',
              'Notificaciones instantáneas por Socket.io',
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-sm text-white/70">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--lagoon)/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-(--lagoon)" />
                </span>
                {feat}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/30">© 2025 TeamSync Feedback Hub</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-(--lagoon) to-(--lagoon-deep)">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-(--sea-ink)">TeamSync</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-(--sea-ink)">Bienvenido de vuelta</h1>
            <p className="text-sm text-(--sea-ink-soft)">
              Inicia sesión en tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="tu@empresa.com"
              leftIcon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              error={errors.email?.message}
              {...register('email', { required: 'El email es obligatorio.' })}
            />

            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password', { required: 'La contraseña es obligatoria.' })}
            />

            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full">
              Iniciar sesión
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-(--line)" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-(--bg-base) px-2 text-(--sea-ink-soft)">o continúa con</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void authService.googleAuth()}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-(--line) bg-(--surface) px-4 py-2.5 text-sm font-medium text-(--sea-ink) transition-all hover:bg-(--surface-strong) hover:border-(--lagoon-deep)"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar con Google
          </button>

          <p className="text-center text-sm text-(--sea-ink-soft)">
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="font-semibold text-(--lagoon-deep) hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
