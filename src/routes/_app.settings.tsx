import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { User, Mail, Building2, FileText, Bell, Lock, Camera } from 'lucide-react'
import { TopBar } from '#/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Input, Textarea } from '#/components/ui/input'
import { Avatar } from '#/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '#/components/ui/tabs'
import { authService } from '#/services/auth.service'
import { useAuthStore } from '#/stores/auth.store'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
})

type ProfileForm = { name: string; bio: string; department: string }
type PasswordForm = { current: string; next: string; confirm: string }

function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const [notifPrefs, setNotifPrefs] = useState({
    email: user?.notificationPreferences.email ?? true,
    inApp: user?.notificationPreferences.inApp ?? true,
  })
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // ── Profile form ──────────────────────────────────────────────────────────
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: savingProfile },
  } = useForm<ProfileForm>({
    defaultValues: { name: user?.name ?? '', bio: user?.bio ?? '', department: user?.department ?? '' },
  })

  const { mutateAsync: saveProfileAsync } = useMutation({
    mutationFn: (data: ProfileForm) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    },
  })

  // ── Password form ─────────────────────────────────────────────────────────
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: changingPassword },
  } = useForm<PasswordForm>()

  const { mutateAsync: changePasswordAsync } = useMutation({
    mutationFn: (data: PasswordForm) => authService.changePassword(data.current, data.next),
    onSuccess: () => {
      resetPassword()
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 3000)
    },
  })

  return (
    <div>
      <TopBar title="Configuración" subtitle="Gestiona tu perfil y preferencias" />

      <div className="p-6">
        <Tabs defaultValue="profile" className="max-w-2xl">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4" /> Notificaciones
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4" /> Seguridad
            </TabsTrigger>
          </TabsList>

          {/* Profile tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="p-5">
                <CardTitle>Información de perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit((data) => saveProfileAsync(data))} className="space-y-5">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <Avatar name={user?.name ?? 'U'} src={user?.avatar} size="xl" />
                    <div>
                      <Button variant="outline" size="sm" leftIcon={<Camera className="h-4 w-4" />}>
                        Cambiar foto
                      </Button>
                      <p className="mt-1.5 text-xs text-(--sea-ink-soft)">JPG, PNG o WebP. Máx 2MB.</p>
                    </div>
                  </div>

                  <Input
                    label="Nombre completo"
                    leftIcon={<User className="h-4 w-4" />}
                    error={profileErrors.name?.message}
                    {...registerProfile('name', { required: 'El nombre es obligatorio.' })}
                  />

                  <Input
                    label="Email"
                    value={user?.email ?? ''}
                    disabled
                    leftIcon={<Mail className="h-4 w-4" />}
                  />

                  <Input
                    label="Departamento"
                    leftIcon={<Building2 className="h-4 w-4" />}
                    placeholder="Ingeniería, Producto, Diseño…"
                    {...registerProfile('department')}
                  />

                  <Textarea
                    label="Bio"
                    placeholder="Cuéntale a tu equipo sobre ti…"
                    rows={3}
                    {...registerProfile('bio')}
                  />

                  {profileSuccess && (
                    <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-700">
                      Perfil actualizado correctamente.
                    </p>
                  )}

                  <Button type="submit" loading={savingProfile} leftIcon={<FileText className="h-4 w-4" />}>
                    Guardar cambios
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader className="p-5">
                <CardTitle>Preferencias de notificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: 'email' as const,
                    label: 'Notificaciones por email',
                    desc: 'Recibe un email cuando recibas feedback, menciones u objetivos asignados.',
                  },
                  {
                    key: 'inApp' as const,
                    label: 'Notificaciones in-app',
                    desc: 'Muestra el contador de notificaciones dentro de la aplicación.',
                  },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-4 rounded-xl border border-(--line) p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-(--sea-ink)">{label}</p>
                      <p className="text-xs text-(--sea-ink-soft) mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                        notifPrefs[key] ? 'bg-(--lagoon-deep)' : 'bg-(--line)'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          notifPrefs[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <Button onClick={() => authService.updateProfile({ notificationPreferences: notifPrefs } as Parameters<typeof authService.updateProfile>[0])}>
                  Guardar preferencias
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader className="p-5">
                <CardTitle>Cambiar contraseña</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit((data) => changePasswordAsync(data))} className="space-y-4">
                  <Input
                    label="Contraseña actual"
                    type="password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={passwordErrors.current?.message}
                    {...registerPassword('current', { required: 'Introduce tu contraseña actual.' })}
                  />
                  <Input
                    label="Nueva contraseña"
                    type="password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={passwordErrors.next?.message}
                    {...registerPassword('next', {
                      required: 'Introduce la nueva contraseña.',
                      minLength: { value: 8, message: 'La nueva contraseña debe tener al menos 8 caracteres.' },
                    })}
                  />
                  <Input
                    label="Confirmar nueva contraseña"
                    type="password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={passwordErrors.confirm?.message}
                    {...registerPassword('confirm', {
                      required: 'Confirma la nueva contraseña.',
                      validate: (v) => v === watchPassword('next') || 'Las contraseñas nuevas no coinciden.',
                    })}
                  />

                  {passwordSuccess && (
                    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
                      Contraseña actualizada correctamente.
                    </p>
                  )}

                  <Button type="submit" loading={changingPassword}>
                    Cambiar contraseña
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
