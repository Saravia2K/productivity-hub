import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Lock, User, Building2, Zap, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '#/hooks/useAuth'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'

export const Route = createFileRoute('/register')({
  component: RegisterGuard,
})

function RegisterGuard() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  if (token) return <Navigate to="/dashboard" replace />
  return <RegisterPage />
}

function RegisterPage() {
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ name: string; email: string; password: string; department: string }>()

  async function onSubmit(data: { name: string; email: string; password: string; department: string }) {
    setServerError('')
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        department: data.department || undefined,
      })
    } catch {
      setServerError('No se pudo crear la cuenta. El email puede estar en uso.')
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-linear-to-br from-[#0e2428] to-[#061014] p-12 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(31,151,144,0.18),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(21,90,48,0.2),transparent_66%)]" />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-(--lagoon) to-(--lagoon-deep)">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">TeamSync</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-(--lagoon)">
              Únete hoy
            </p>
            <h2 className="text-4xl font-bold leading-tight text-white">
              Construye una cultura de feedback en tu equipo
            </h2>
            <p className="text-base text-white/60 leading-relaxed">
              Configura tu workspace en menos de 2 minutos y empieza a dar y recibir feedback significativo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Feedback anónimo', desc: 'Sin barreras psicológicas' },
              { label: 'Tiempo real', desc: 'Socket.io colaborativo' },
              { label: 'Drag & Drop', desc: 'Tablero Kanban fluido' },
              { label: 'Roles y permisos', desc: 'Admin, Manager, Employee' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-1"
              >
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/30">© 2025 TeamSync Feedback Hub</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-(--lagoon) to-(--lagoon-deep)">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-(--sea-ink)">TeamSync</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-(--sea-ink)">Crea tu cuenta</h1>
            <p className="text-sm text-(--sea-ink-soft)">
              Únete a tu equipo en TeamSync Feedback Hub
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nombre completo"
              type="text"
              placeholder="Ana García"
              leftIcon={<User className="h-4 w-4" />}
              autoComplete="name"
              error={errors.name?.message}
              {...register('name', { required: 'El nombre es obligatorio.' })}
            />

            <Input
              label="Email corporativo"
              type="email"
              placeholder="ana@empresa.com"
              leftIcon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              error={errors.email?.message}
              {...register('email', { required: 'El email es obligatorio.' })}
            />

            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
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
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password', {
                required: 'La contraseña es obligatoria.',
                minLength: { value: 8, message: 'La contraseña debe tener al menos 8 caracteres.' },
              })}
            />

            <Input
              label="Departamento (opcional)"
              type="text"
              placeholder="Ingeniería, Producto, Diseño…"
              leftIcon={<Building2 className="h-4 w-4" />}
              autoComplete="organization"
              {...register('department')}
            />

            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full">
              Crear cuenta
            </Button>
          </form>

          <p className="text-center text-xs text-(--sea-ink-soft)">
            Al registrarte aceptas los{' '}
            <span className="text-(--lagoon-deep) cursor-pointer hover:underline">
              Términos de Servicio
            </span>{' '}
            y la{' '}
            <span className="text-(--lagoon-deep) cursor-pointer hover:underline">
              Política de Privacidad
            </span>
          </p>

          <p className="text-center text-sm text-(--sea-ink-soft)">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="font-semibold text-(--lagoon-deep) hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
