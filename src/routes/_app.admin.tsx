import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ShieldCheck,
  Users,
  Activity,
  MoreVertical,
  Search,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { TopBar } from '#/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Avatar } from '#/components/ui/avatar'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { PageSpinner } from '#/components/ui/spinner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { userService } from '#/services/user.service'
import { useAuthStore } from '#/stores/auth.store'
import { formatRelativeTime } from '#/lib/utils'
import { cn } from '#/lib/utils'
import type { User, UserRole } from '#/types'

export const Route = createFileRoute('/_app/admin')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return
    // Only admin users can access this route
    const stored = localStorage.getItem('auth-storage')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { state?: { user?: { role?: string } } }
        const role = parsed?.state?.user?.role
        if (role !== 'admin') throw redirect({ to: '/dashboard' })
      } catch {
        // non-JSON or missing — let the component handle it
      }
    }
  },
  component: AdminPage,
})

const ACTIVITY_DOT_COLOR: Record<string, string> = {
  feedback_received: 'bg-[var(--lagoon)]',
  mention: 'bg-purple-500',
  objective_assigned: 'bg-blue-500',
  objective_status_changed: 'bg-blue-500',
  register: 'bg-emerald-500',
  login: 'bg-amber-500',
}

type SortField = 'name' | 'role' | 'createdAt'
type SortDir = 'asc' | 'desc'

// ─── User row ─────────────────────────────────────────────────────────────────
function UserRow({
  user,
  currentUserId,
  onRoleChange,
}: {
  user: User
  currentUserId: string
  onRoleChange: (id: string, role: UserRole) => void
}) {
  const isSelf = user._id === currentUserId

  return (
    <tr className="border-b border-[var(--line)] transition-colors hover:bg-[var(--surface)]/40">
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-[var(--sea-ink)]">
              {user.name}
              {isSelf && <span className="ml-1.5 text-xs text-[var(--sea-ink-soft)]">(tú)</span>}
            </p>
            <p className="text-xs text-[var(--sea-ink-soft)]">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <span className="text-sm text-[var(--sea-ink-soft)]">{user.department ?? '—'}</span>
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
          <span className={cn('h-1.5 w-1.5 rounded-full', user.emailVerified ? 'bg-emerald-500' : 'bg-amber-500')} />
          {user.emailVerified ? 'Verificado' : 'Pendiente'}
        </span>
      </td>
      <td className="px-3 py-3 text-xs text-[var(--sea-ink-soft)]">
        {formatRelativeTime(user.createdAt)}
      </td>
      <td className="py-3 pl-3 pr-4 text-right">
        {!isSelf && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-lg p-1.5 text-[var(--sea-ink-soft)] hover:bg-[var(--surface)] hover:text-[var(--sea-ink)]">
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

// ─── Main page ────────────────────────────────────────────────────────────────
function AdminPage() {
  const qc = useQueryClient()
  const { user: currentUser } = useAuthStore()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userService.getAll({ limit: 200 }),
  })

  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: userService.getDashboardMetrics,
  })

  const { mutate: updateRole } = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      userService.updateRole(id, role),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const users = data?.data ?? []

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  const filtered = users
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.department ?? '').toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortField === 'name') return a.name.localeCompare(b.name) * dir
      if (sortField === 'role') return a.role.localeCompare(b.role) * dir
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
    })

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortDir === 'asc' ? (
        <ChevronUp className="inline h-3 w-3" />
      ) : (
        <ChevronDown className="inline h-3 w-3" />
      )
    ) : null

  if (isLoading && !data) return <PageSpinner />

  const roleCount = (role: UserRole) => users.filter((u) => u.role === role).length

  return (
    <div>
      <TopBar title="Panel de Administración" subtitle="Gestiona usuarios, roles y actividad" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total usuarios', value: users.length, icon: <Users className="h-5 w-5" />, color: '#4fb8b2' },
            { label: 'Administradores', value: roleCount('admin'), icon: <ShieldCheck className="h-5 w-5" />, color: '#8b5cf6' },
            { label: 'Managers', value: roleCount('manager'), icon: <Users className="h-5 w-5" />, color: '#3b82f6' },
            { label: 'Empleados', value: roleCount('employee'), icon: <Users className="h-5 w-5" />, color: '#10b981' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${stat.color}18`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--sea-ink)]">{stat.value}</p>
                  <p className="text-xs text-[var(--sea-ink-soft)]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users table */}
        <Card>
          <CardHeader className="p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle>Usuarios</CardTitle>
              <Input
                placeholder="Buscar por nombre, email o departamento…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                className="w-72"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  {[
                    { key: 'name', label: 'Usuario' },
                    { key: null, label: 'Departamento' },
                    { key: 'role', label: 'Rol' },
                    { key: null, label: 'Email' },
                    { key: 'createdAt', label: 'Miembro desde' },
                    { key: null, label: '' },
                  ].map(({ key, label }, i) => (
                    <th
                      key={i}
                      onClick={() => key && handleSort(key as SortField)}
                      className={cn(
                        'py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]',
                        i === 0 ? 'pl-4 pr-3' : 'px-3',
                        key && 'cursor-pointer select-none hover:text-[var(--sea-ink)]',
                      )}
                    >
                      {label}
                      {key && <SortIcon field={key as SortField} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    currentUserId={currentUser?._id ?? ''}
                    onRoleChange={(id, role) => updateRole({ id, role })}
                  />
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-[var(--sea-ink-soft)]">
                No se encontraron usuarios con ese filtro.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity log */}
        <Card>
          <CardHeader className="p-5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--lagoon-deep)]" />
              <CardTitle>Log de actividad</CardTitle>
              <Badge variant="default" className="ml-auto">Últimos 30 días</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {!metrics?.recentActivity?.length ? (
              <p className="py-6 text-center text-sm text-[var(--sea-ink-soft)]">
                Sin actividad reciente.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--line)]">
                {metrics.recentActivity.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-4 py-3">
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        ACTIVITY_DOT_COLOR[entry.type] ?? 'bg-[var(--sea-ink-soft)]',
                      )}
                    />
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                      {entry.user && (
                        <Avatar name={entry.user.name} src={entry.user.avatar} size="xs" />
                      )}
                      <p className="flex-1 truncate text-sm text-[var(--sea-ink)]">
                        {entry.message}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--sea-ink-soft)]">
                      {formatRelativeTime(entry.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
