import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
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

function SettingsPage() {
  const { user, setUser } = useAuthStore()

  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    bio: user?.bio ?? '',
    department: user?.department ?? '',
  })
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [notifPrefs, setNotifPrefs] = useState({
    email: user?.notificationPreferences.email ?? true,
    inApp: user?.notificationPreferences.inApp ?? true,
  })

  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const { mutate: saveProfile, isPending: savingProfile } = useMutation({
    mutationFn: () => authService.updateProfile(profile),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    },
  })

  const { mutate: changePassword, isPending: changingPassword } = useMutation({
    mutationFn: () => authService.changePassword(passwords.current, passwords.next),
    onSuccess: () => {
      setPasswords({ current: '', next: '', confirm: '' })
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 3000)
    },
    onError: () => setPasswordError('Contraseña actual incorrecta.'),
  })

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    if (passwords.next !== passwords.confirm) {
      setPasswordError('Las contraseñas nuevas no coinciden.')
      return
    }
    if (passwords.next.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    changePassword()
  }

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
              <CardContent className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar name={user?.name ?? 'U'} src={user?.avatar} size="xl" />
                  <div>
                    <Button variant="outline" size="sm" leftIcon={<Camera className="h-4 w-4" />}>
                      Cambiar foto
                    </Button>
                    <p className="mt-1.5 text-xs text-[var(--sea-ink-soft)]">JPG, PNG o WebP. Máx 2MB.</p>
                  </div>
                </div>

                <Input
                  label="Nombre completo"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  leftIcon={<User className="h-4 w-4" />}
                />

                <Input
                  label="Email"
                  value={user?.email ?? ''}
                  disabled
                  leftIcon={<Mail className="h-4 w-4" />}
                />

                <Input
                  label="Departamento"
                  value={profile.department}
                  onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
                  leftIcon={<Building2 className="h-4 w-4" />}
                  placeholder="Ingeniería, Producto, Diseño…"
                />

                <Textarea
                  label="Bio"
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Cuéntale a tu equipo sobre ti…"
                  rows={3}
                />

                {profileSuccess && (
                  <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-700">
                    Perfil actualizado correctamente.
                  </p>
                )}

                <Button
                  loading={savingProfile}
                  onClick={() => saveProfile()}
                  leftIcon={<FileText className="h-4 w-4" />}
                >
                  Guardar cambios
                </Button>
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
                    className="flex items-start justify-between gap-4 rounded-xl border border-[var(--line)] p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--sea-ink)]">{label}</p>
                      <p className="text-xs text-[var(--sea-ink-soft)] mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                        notifPrefs[key] ? 'bg-[var(--lagoon-deep)]' : 'bg-[var(--line)]'
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
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <Input
                    label="Contraseña actual"
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                    leftIcon={<Lock className="h-4 w-4" />}
                    required
                  />
                  <Input
                    label="Nueva contraseña"
                    type="password"
                    value={passwords.next}
                    onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                    leftIcon={<Lock className="h-4 w-4" />}
                    required
                  />
                  <Input
                    label="Confirmar nueva contraseña"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                    leftIcon={<Lock className="h-4 w-4" />}
                    required
                  />

                  {passwordError && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                      {passwordError}
                    </p>
                  )}
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
