import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  MessageSquarePlus,
  Target,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { userService } from '#/services/user.service'
import { useAuthStore } from '#/stores/auth.store'
import { TopBar } from '#/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Avatar } from '#/components/ui/avatar'
import { PageSpinner } from '#/components/ui/spinner'
import { formatRelativeTime } from '#/lib/utils'
import type { DashboardMetrics } from '#/types'

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})

// ─── Mock data for UI while backend is being integrated ──────────────────────
const MOCK_METRICS: DashboardMetrics = {
  pendingFeedback: 4,
  completedObjectives: 12,
  teamSatisfaction: 87,
  activeTeamMembers: 9,
  feedbackTrend: [
    { month: 'Ene', positive: 8, constructive: 3 },
    { month: 'Feb', positive: 12, constructive: 5 },
    { month: 'Mar', positive: 10, constructive: 4 },
    { month: 'Abr', positive: 15, constructive: 6 },
    { month: 'May', positive: 18, constructive: 4 },
    { month: 'Jun', positive: 22, constructive: 7 },
  ],
  objectivesByStatus: [
    { status: 'todo', count: 5 },
    { status: 'in-progress', count: 8 },
    { status: 'in-review', count: 3 },
    { status: 'completed', count: 12 },
  ],
  recentActivity: [
    {
      id: '1',
      type: 'feedback_received',
      message: 'Carlos López te envió feedback positivo sobre tu liderazgo',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      user: { _id: '1', name: 'Carlos López', avatar: undefined },
    },
    {
      id: '2',
      type: 'objective_assigned',
      message: 'Se te asignó el objetivo "Lanzar v2 del dashboard"',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      user: { _id: '2', name: 'María Torres', avatar: undefined },
    },
    {
      id: '3',
      type: 'mention',
      message: 'Ana García te mencionó en un comentario',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      user: { _id: '3', name: 'Ana García', avatar: undefined },
    },
    {
      id: '4',
      type: 'objective_status_changed',
      message: '"Refactorizar API de autenticación" pasó a En Revisión',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ],
}

const STATUS_COLORS: Record<string, string> = {
  todo: '#94a3b8',
  'in-progress': '#3b82f6',
  'in-review': '#f59e0b',
  completed: '#10b981',
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'Por hacer',
  'in-progress': 'En progreso',
  'in-review': 'En revisión',
  completed: 'Completado',
}

// ─── Metric card ─────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  color: string
}

function MetricCard({ label, value, icon, trend, color }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-(--sea-ink-soft)">
              {label}
            </p>
            <p className="text-3xl font-bold text-(--sea-ink)">{value}</p>
            {trend && (
              <p className="flex items-center gap-1 text-xs text-(--sea-ink-soft)">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                {trend}
              </p>
            )}
          </div>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: `${color}18`, color }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page component ───────────────────────────────────────────────────────────
function DashboardPage() {
  const { user } = useAuthStore()

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: userService.getDashboardMetrics,
    placeholderData: MOCK_METRICS,
  })

  const data = metrics ?? MOCK_METRICS

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  if (isLoading && !metrics) return <PageSpinner />

  return (
    <div>
      <TopBar
        title={`${greeting()}, ${user?.name?.split(' ')[0] ?? 'Usuario'} 👋`}
        subtitle="Aquí tienes el resumen de tu equipo"
      />

      <div className="p-6 space-y-6">
        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Feedback pendiente"
            value={data.pendingFeedback}
            icon={<MessageSquarePlus className="h-5 w-5" />}
            color="#f59e0b"
            trend="+2 esta semana"
          />
          <MetricCard
            label="Objetivos completados"
            value={data.completedObjectives}
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="#10b981"
            trend="+3 este mes"
          />
          <MetricCard
            label="Satisfacción del equipo"
            value={`${data.teamSatisfaction}%`}
            icon={<Target className="h-5 w-5" />}
            color="#3b82f6"
            trend="+5% vs mes anterior"
          />
          <MetricCard
            label="Miembros activos"
            value={data.activeTeamMembers}
            icon={<Users className="h-5 w-5" />}
            color="#8b5cf6"
          />
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Feedback trend — area chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tendencia de Feedback</CardTitle>
                  <p className="mt-0.5 text-xs text-(--sea-ink-soft)">Últimos 6 meses</p>
                </div>
                <div className="flex gap-3 text-xs text-(--sea-ink-soft)">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#4fb8b2]" />
                    Positivo
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                    Constructivo
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.feedbackTrend} margin={{ top: 4, right: 12, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4fb8b2" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4fb8b2" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorConstructive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,58,64,0.08)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--sea-ink-soft)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--sea-ink-soft)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface-strong)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: 'var(--sea-ink)',
                    }}
                  />
                  <Area type="monotone" dataKey="positive" stroke="#4fb8b2" strokeWidth={2} fill="url(#colorPositive)" name="Positivo" />
                  <Area type="monotone" dataKey="constructive" stroke="#f59e0b" strokeWidth={2} fill="url(#colorConstructive)" name="Constructivo" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Objectives by status — donut */}
          <Card>
            <CardHeader className="p-5">
              <CardTitle>Objetivos por estado</CardTitle>
              <p className="text-xs text-(--sea-ink-soft)">Distribución actual</p>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={data.objectivesByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {data.objectivesByStatus.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface-strong)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value, name) => [value, STATUS_LABELS[name as string] ?? name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <ul className="mt-2 space-y-1.5">
                {data.objectivesByStatus.map((entry) => (
                  <li key={entry.status} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-(--sea-ink-soft)">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: STATUS_COLORS[entry.status] }}
                      />
                      {STATUS_LABELS[entry.status]}
                    </span>
                    <span className="font-semibold text-(--sea-ink)">{entry.count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity + quick actions */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Activity feed */}
          <Card className="lg:col-span-2">
            <CardHeader className="p-5">
              <div className="flex items-center justify-between">
                <CardTitle>Actividad reciente</CardTitle>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(79,184,178,0.12)]">
                  <Zap className="h-3 w-3 text-(--lagoon-deep)" />
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="divide-y divide-(--line)">
                {data.recentActivity.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 py-3">
                    {item.user ? (
                      <Avatar name={item.user.name} src={item.user.avatar} size="sm" />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(79,184,178,0.12)]">
                        <Clock className="h-4 w-4 text-(--lagoon-deep)" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-(--sea-ink) leading-snug">{item.message}</p>
                      <p className="mt-0.5 text-xs text-(--sea-ink-soft)">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader className="p-5">
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-2">
              {[
                {
                  label: 'Dar feedback',
                  desc: 'Comparte tu perspectiva',
                  to: '/feedback',
                  color: '#4fb8b2',
                  icon: <MessageSquarePlus className="h-5 w-5" />,
                },
                {
                  label: 'Nuevo objetivo',
                  desc: 'Añade una tarea al Kanban',
                  to: '/objectives',
                  color: '#3b82f6',
                  icon: <Target className="h-5 w-5" />,
                },
                {
                  label: 'Ver mi equipo',
                  desc: 'Métricas y miembros',
                  to: '/teams',
                  color: '#8b5cf6',
                  icon: <Users className="h-5 w-5" />,
                },
              ].map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center gap-3 rounded-xl border border-(--line) p-3 transition-all hover:border-(--lagoon-deep) hover:bg-[rgba(79,184,178,0.04)]"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${action.color}18`, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-(--sea-ink)">{action.label}</p>
                    <p className="text-xs text-(--sea-ink-soft)">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-(--sea-ink-soft)" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Satisfaction banner */}
        <Card className="bg-linear-to-r from-(--sea-ink) to-[#1a4550] border-0">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-(--lagoon)">
                Satisfacción del equipo
              </p>
              <p className="text-2xl font-bold text-white">{data.teamSatisfaction}% positivo</p>
              <p className="text-sm text-white/60">
                Basado en los últimos {data.completedObjectives} ciclos de feedback
              </p>
            </div>
            <div className="relative h-20 w-20">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4fb8b2"
                  strokeWidth="3"
                  strokeDasharray={`${data.teamSatisfaction}, 100`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                {data.teamSatisfaction}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Role badge */}
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-(--sea-ink-soft)">Tu rol:</span>
            <Badge variant={user.role}>{user.role}</Badge>
            {user.department && (
              <>
                <span className="text-xs text-(--sea-ink-soft)">·</span>
                <span className="text-xs text-(--sea-ink-soft)">{user.department}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
