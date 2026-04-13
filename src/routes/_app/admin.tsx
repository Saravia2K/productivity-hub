import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShieldCheck, Users, Activity, Search, ChevronUp, ChevronDown } from 'lucide-react'
import { TopBar } from '#/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Avatar } from '#/components/ui/avatar'
import { Input } from '#/components/ui/input'
import { StatCard } from '#/components/ui/stat-card'
import { PageSpinner } from '#/components/ui/spinner'
import { UserRow } from '#/components/features/admin/UserRow'
import { userService } from '#/services/user.service'
import { useAuthStore } from '#/stores/auth.store'
import { formatRelativeTime, cn } from '#/lib/utils'
import type { UserRole } from '#/types'

export const Route = createFileRoute('/_app/admin')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('auth-storage')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { state?: { user?: { role?: string } } }
        const role = parsed?.state?.user?.role
        if (role !== 'admin') throw redirect({ to: '/dashboard' })
      } catch {
        // non-JSON or missing — component will handle it
      }
    }
  },
  component: AdminPage,
})

const ACTIVITY_DOT_COLOR: Record<string, string> = {
  feedback_received: 'bg-(--lagoon)',
  mention: 'bg-purple-500',
  objective_assigned: 'bg-blue-500',
  objective_status_changed: 'bg-blue-500',
  register: 'bg-emerald-500',
  login: 'bg-amber-500',
}

type SortField = 'name' | 'role' | 'createdAt'
type SortDir = 'asc' | 'desc'

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return null
  return sortDir === 'asc' ? (
    <ChevronUp className="inline h-3 w-3" />
  ) : (
    <ChevronDown className="inline h-3 w-3" />
  )
}

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
    else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const roleCount = (role: UserRole) => users.filter((u) => u.role === role).length

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

  const TABLE_COLUMNS: { key: SortField | null; label: string }[] = [
    { key: 'name', label: 'Usuario' },
    { key: null, label: 'Departamento' },
    { key: 'role', label: 'Rol' },
    { key: null, label: 'Email' },
    { key: 'createdAt', label: 'Miembro desde' },
    { key: null, label: '' },
  ]

  if (isLoading && !data) return <PageSpinner />

  return (
    <div>
      <TopBar title="Panel de Administración" subtitle="Gestiona usuarios, roles y actividad" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Total usuarios', value: users.length, icon: <Users className="h-5 w-5" />, color: '#1f9790' },
            { label: 'Administradores', value: roleCount('admin'), icon: <ShieldCheck className="h-5 w-5" />, color: '#8b5cf6' },
            { label: 'Managers', value: roleCount('manager'), icon: <Users className="h-5 w-5" />, color: '#3b82f6' },
            { label: 'Empleados', value: roleCount('employee'), icon: <Users className="h-5 w-5" />, color: '#10b981' },
          ].map((stat) => (
            <StatCard key={stat.label} {...stat} size="md" />
          ))}
        </div>

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
                <tr className="border-b border-(--line)">
                  {TABLE_COLUMNS.map(({ key, label }, i) => (
                    <th
                      key={i}
                      onClick={() => key && handleSort(key)}
                      className={cn(
                        'py-3 text-left text-xs font-semibold uppercase tracking-wider text-(--sea-ink-soft)',
                        i === 0 ? 'pl-4 pr-3' : 'px-3',
                        key && 'cursor-pointer select-none hover:text-(--sea-ink)',
                      )}
                    >
                      {label}
                      {key && (
                        <SortIcon field={key} sortField={sortField} sortDir={sortDir} />
                      )}
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
              <div className="py-12 text-center text-sm text-(--sea-ink-soft)">
                No se encontraron usuarios con ese filtro.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-5">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-(--lagoon-deep)" />
              <CardTitle>Log de actividad</CardTitle>
              <Badge variant="default" className="ml-auto">Últimos 30 días</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {!metrics?.recentActivity?.length ? (
              <p className="py-6 text-center text-sm text-(--sea-ink-soft)">
                Sin actividad reciente.
              </p>
            ) : (
              <ul className="divide-y divide-(--line)">
                {metrics.recentActivity.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-4 py-3">
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        ACTIVITY_DOT_COLOR[entry.type] ?? 'bg-(--sea-ink-soft)',
                      )}
                    />
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                      {entry.user && (
                        <Avatar name={entry.user.name} src={entry.user.avatar} size="xs" />
                      )}
                      <p className="flex-1 truncate text-sm text-(--sea-ink)">{entry.message}</p>
                    </div>
                    <span className="shrink-0 text-xs text-(--sea-ink-soft)">
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
