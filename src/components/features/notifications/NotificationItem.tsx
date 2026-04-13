import {
  Bell,
  MessageSquarePlus,
  Target,
  AtSign,
  CheckCheck,
  Trash2,
  CheckCircle2,
} from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { formatRelativeTime } from '#/lib/utils'
import { cn } from '#/lib/utils'
import type { Notification, NotificationType } from '#/types'

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  feedback_received: <MessageSquarePlus className="h-4 w-4" />,
  objective_assigned: <Target className="h-4 w-4" />,
  mention: <AtSign className="h-4 w-4" />,
  objective_status_changed: <CheckCircle2 className="h-4 w-4" />,
}

const TYPE_COLOR: Record<NotificationType, string> = {
  feedback_received: '#1f9790',
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

// Re-export for consumers that need to reference them
export { TYPE_COLOR, TYPE_LABEL, TYPE_ICON }

interface NotificationItemProps {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationItem({ notification, onMarkRead, onDelete }: NotificationItemProps) {
  const color = TYPE_COLOR[notification.type]

  return (
    <div
      className={cn(
        'group flex items-start gap-4 rounded-2xl border p-4 transition-all',
        notification.read
          ? 'border-(--line) bg-transparent'
          : 'border-(--lagoon-deep)/20 bg-[var(--lagoon-tint-4)]',
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}18`, color }}
      >
        {TYPE_ICON[notification.type]}
      </div>

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
