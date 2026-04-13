import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { authService } from '#/services/auth.service'
import { useAuthStore } from '#/stores/auth.store'

const NOTIFICATION_OPTIONS = [
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
]

export function NotificationsTab() {
  const { user } = useAuthStore()
  const [prefs, setPrefs] = useState({
    email: user?.notificationPreferences.email ?? true,
    inApp: user?.notificationPreferences.inApp ?? true,
  })

  function handleSave() {
    void authService.updateNotificationPreferences(prefs)
  }

  return (
    <Card>
      <CardHeader className="p-5">
        <CardTitle>Preferencias de notificaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {NOTIFICATION_OPTIONS.map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-start justify-between gap-4 rounded-xl border border-(--line) p-4"
          >
            <div>
              <p className="text-sm font-medium text-(--sea-ink)">{label}</p>
              <p className="text-xs text-(--sea-ink-soft) mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                prefs[key] ? 'bg-(--lagoon-deep)' : 'bg-(--line)'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  prefs[key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}

        <Button onClick={handleSave}>Guardar preferencias</Button>
      </CardContent>
    </Card>
  )
}
