import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  MessageSquarePlus,
  Target,
  AtSign,
  CheckCheck,
  Trash2,
  CheckCircle2,
} from 'lucide-react'
import { TopBar } from '#/components/layout/TopBar'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { EmptyState } from '#/components/ui/empty-state'
import { PageSpinner } from '#/components/ui/spinner'
import { notificationService } from '#/services/notification.service'
import { useNotificationStore } from '#/stores/notification.store'
import { formatRelativeTime } from '#/lib/utils'
import { cn } from '#/lib/utils'
import type { Notification, NotificationType } from '#/types'

export const Route = createFileRoute('/_app/notifications')({
  component: NotificationsPage,
})

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    _id: 'n1',
    recipient: 'u1',
    type: 'feedback_received',
    message: 'Carlos López te envió feedback positivo sobre tu liderazgo en el sprint.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    _id: 'n2',
    recipient: 'u1',
    type: 'objective_assigned',
    message: 'Se te asignó el objetivo "Refactorizar API de autenticación".',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    _id: 'n3',
    recipient: 'u1',
    type: 'mention',
    message: 'Ana García te mencionó en el objetivo "Diseño del dashboard".',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    _id: 'n4',
    recipient: 'u1',
    type: 'objective_status_changed',
    message: '"Documentar endpoints de la API" fue marcado como Completado.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    _id: 'n5',
    recipient: 'u1',
    type: 'feedback_received',
    message: 'Recibiste feedback constructivo sobre comunicación en code reviews.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
]

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  feedback_received: <MessageSquarePlus className="h-4 w-4" />,
  objective_assigned: <Target className="h-4 w-4" />,
  mention: <AtSign className="h-4 w-4" />,
  objective_status_changed: <CheckCircle2 className="h-4 w-4" />,
}

const TYPE_COLOR: Record<NotificationType, string> = {
  feedback_received: '#4fb8b2',
  objective_assigned: '#3b82f6',
  mention: '#8b5cf6',
  objective_status_changed: '#10b981',
}

const TYPE_LABEL: Record<NotificationType, string> = {
  feedback_received: 'Feedback',
  objective_assigned: 'Objetivo',
  mention: 'Mención',
  objective_status_changed: 'Estado',
}

// ─── Notification item ────────────────────────────────────────────────────────
function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const color = TYPE_COLOR[notification.type]

  return (
    <div
      className={cn(
        'group flex items-start gap-4 rounded-2xl border p-4 transition-all',
        notification.read
          ? 'border-(--line) bg-transparent'
          : 'border-(--lagoon-deep)/20 bg-[rgba(79,184,178,0.04)]',
      )}
    >
      {/* Icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}18`, color }}
      >
        {TYPE_ICON[notification.type]}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm leading-snug',
              notification.read ? 'text-(--sea-ink-soft)' : 'font-medium text-(--sea-ink)',
            )}
          >
            {notification.message}
          </p>
          {!notification.read && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-(--lagoon-deep)" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info" className="text-[10px]">
            {TYPE_LABEL[notification.type]}
          </Badge>
          <span className="text-xs text-(--sea-ink-soft)">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.read && (
          <button
            onClick={() => onMarkRead(notification._id)}
            className="rounded-lg p-1.5 text-(--sea-ink-soft) hover:bg-(--surface) hover:text-(--lagoon-deep)"
            title="Marcar como leído"
          >
            <CheckCheck className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(notification._id)}
          className="rounded-lg p-1.5 text-(--sea-ink-soft) hover:bg-red-50 hover:text-red-500"
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
function NotificationsPage() {
  const qc = useQueryClient()
  const { setNotifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll(),
    placeholderData: {
      data: MOCK_NOTIFICATIONS,
      pagination: { total: MOCK_NOTIFICATIONS.length, page: 1, limit: 50, hasMore: false },
    },
    select: (res) => {
      // Sync store with fetched data
      setNotifications(res.data)
      return res.data
    },
  })

  const { mutate: markRead } = useMutation({
    mutationFn: notificationService.markAsRead,
    onMutate: (id) => markAsRead(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const { mutate: markAll } = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onMutate: () => markAllAsRead(),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const { mutate: deleteNotif } = useMutation({
    mutationFn: notificationService.delete,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications = data ?? MOCK_NOTIFICATIONS
  const unread = notifications.filter((n) => !n.read)
  const read = notifications.filter((n) => n.read)

  if (isLoading && !data) return <PageSpinner />

  return (
    <div>
      <TopBar
        title="Notificaciones"
        subtitle={unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
      />

      <div className="p-6 space-y-6">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-3 text-sm">
            <span className="text-(--sea-ink-soft)">Total: <strong className="text-(--sea-ink)">{notifications.length}</strong></span>
            <span className="text-(--sea-ink-soft)">Sin leer: <strong className="text-(--lagoon-deep)">{unreadCount}</strong></span>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckCheck className="h-4 w-4" />}
              onClick={() => markAll(undefined)}
            >
              Marcar todo como leído
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-6 w-6" />}
            title="Sin notificaciones"
            description="Cuando recibas feedback, menciones u objetivos aparecerán aquí."
          />
        ) : (
          <div className="space-y-6">
            {/* Unread */}
            {unread.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-(--sea-ink-soft)">
                  Sin leer ({unread.length})
                </h2>
                <div className="space-y-2">
                  {unread.map((n) => (
                    <NotificationItem
                      key={n._id}
                      notification={n}
                      onMarkRead={(id) => markRead(id)}
                      onDelete={(id) => deleteNotif(id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Read */}
            {read.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-(--sea-ink-soft)">
                  Leídas ({read.length})
                </h2>
                <div className="space-y-2">
                  {read.map((n) => (
                    <NotificationItem
                      key={n._id}
                      notification={n}
                      onMarkRead={(id) => markRead(id)}
                      onDelete={(id) => deleteNotif(id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preferences hint */}
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.1)]">
              <Bell className="h-5 w-5 text-(--lagoon-deep)" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-(--sea-ink)">Preferencias de notificaciones</p>
              <p className="text-xs text-(--sea-ink-soft)">
                Elige qué notificaciones recibir por email o solo in-app.
              </p>
            </div>
            <Button variant="outline" size="sm">Configurar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
