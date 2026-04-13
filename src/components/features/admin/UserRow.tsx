import { MoreVertical } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Avatar } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { formatRelativeTime, cn } from '#/lib/utils'
import type { User, UserRole } from '#/types'

interface UserRowProps {
  user: User
  currentUserId: string
  onRoleChange: (id: string, role: UserRole) => void
}

export function UserRow({ user, currentUserId, onRoleChange }: UserRowProps) {
  const isSelf = user._id === currentUserId

  return (
    <tr className="border-b border-(--line) transition-colors hover:bg-(--surface)/40">
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-(--sea-ink)">
              {user.name}
              {isSelf && <span className="ml-1.5 text-xs text-(--sea-ink-soft)">(tú)</span>}
            </p>
            <p className="text-xs text-(--sea-ink-soft)">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <span className="text-sm text-(--sea-ink-soft)">{user.department ?? '—'}</span>
      </td>
      <td className="px-3 py-3">
        <Badge variant={user.role}>{user.role}</Badge>
      </td>
      <td className="px-3 py-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            user.emailVerified
              ? 'bg-emerald-500/10 text-emerald-600'
              : 'bg-amber-500/10 text-amber-600',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              user.emailVerified ? 'bg-emerald-500' : 'bg-amber-500',
            )}
          />
          {user.emailVerified ? 'Verificado' : 'Pendiente'}
        </span>
      </td>
      <td className="px-3 py-3 text-xs text-(--sea-ink-soft)">
        {formatRelativeTime(user.createdAt)}
      </td>
      <td className="py-3 pl-3 pr-4 text-right">
        {!isSelf && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-lg p-1.5 text-(--sea-ink-soft) hover:bg-(--surface) hover:text-(--sea-ink)">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Cambiar rol</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(['admin', 'manager', 'employee'] as UserRole[]).map((role) => (
                <DropdownMenuItem
                  key={role}
                  disabled={user.role === role}
                  onClick={() => onRoleChange(user._id, role)}
                  className={user.role === role ? 'font-semibold' : ''}
                >
                  <Badge variant={role} className="mr-2">{role}</Badge>
                  {role === 'admin' ? 'Administrador' : role === 'manager' ? 'Manager' : 'Empleado'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </td>
    </tr>
  )
}
