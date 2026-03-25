import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  MessageCircle,
  Crown,
  UserPlus,
  Send,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import { TopBar } from '#/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Avatar } from '#/components/ui/avatar'
import { Input } from '#/components/ui/input'
import { EmptyState } from '#/components/ui/empty-state'
import { teamService } from '#/services/team.service'
import { useAuthStore } from '#/stores/auth.store'
import { getSocket } from '#/lib/socket'
import { formatRelativeTime } from '#/lib/utils'
import type { Team, ChatMessage } from '#/types'

export const Route = createFileRoute('/_app/teams')({
  component: TeamsPage,
})

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_TEAMS: Team[] = [
  {
    _id: 'team1',
    name: 'Equipo de Ingeniería',
    description: 'Backend, frontend e infraestructura',
    manager: { _id: 'u3', name: 'Carlos López', role: 'manager', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' },
    members: [
      { user: { _id: 'u1', name: 'Tú', role: 'employee', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' }, role: 'employee', joinedAt: '' },
      { user: { _id: 'u2', name: 'Ana García', role: 'employee', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' }, role: 'employee', joinedAt: '' },
      { user: { _id: 'u3', name: 'Carlos López', role: 'manager', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' }, role: 'manager', joinedAt: '' },
      { user: { _id: 'u4', name: 'María Torres', role: 'employee', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' }, role: 'employee', joinedAt: '' },
    ],
    createdAt: '', updatedAt: '',
  },
  {
    _id: 'team2',
    name: 'Diseño de Producto',
    description: 'UX/UI y research de usuario',
    manager: { _id: 'u5', name: 'Laura Sánchez', role: 'manager', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' },
    members: [
      { user: { _id: 'u5', name: 'Laura Sánchez', role: 'manager', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' }, role: 'manager', joinedAt: '' },
      { user: { _id: 'u6', name: 'Roberto Kim', role: 'employee', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' }, role: 'employee', joinedAt: '' },
    ],
    createdAt: '', updatedAt: '',
  },
]

const MOCK_MESSAGES: ChatMessage[] = [
  {
    _id: 'm1',
    author: { _id: 'u3', name: 'Carlos López', role: 'manager', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' },
    content: '¡Buen trabajo en el sprint de esta semana, equipo! 🎉',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    _id: 'm2',
    author: { _id: 'u2', name: 'Ana García', role: 'employee', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' },
    content: 'Gracias! Terminé el diseño del dashboard. Lo comparto en la reunión de mañana.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    _id: 'm3',
    author: { _id: 'u1', name: 'Tú', role: 'employee', email: '', emailVerified: true, notificationPreferences: { email: true, inApp: true }, createdAt: '', updatedAt: '' },
    content: 'Perfecto, yo ya tengo casi lista la refactorización del auth. Solo me quedan los tests.',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
]

// ─── Team card ────────────────────────────────────────────────────────────────
function TeamCard({ team, selected, onSelect }: { team: Team; selected: boolean; onSelect: () => void }) {
  return (
    <Card
      hoverable
      onClick={onSelect}
      className={selected ? 'border-[var(--lagoon-deep)] ring-1 ring-[var(--lagoon-deep)]' : ''}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--sea-ink)]">{team.name}</h3>
            {team.description && (
              <p className="text-xs text-[var(--sea-ink-soft)] mt-0.5">{team.description}</p>
            )}
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(79,184,178,0.1)]">
            <Users className="h-4 w-4 text-[var(--lagoon-deep)]" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {team.members.slice(0, 4).map((m) => (
              <Avatar
                key={m.user._id}
                name={m.user.name}
                size="xs"
                className="ring-2 ring-[var(--surface-strong)]"
              />
            ))}
            {team.members.length > 4 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface)] ring-2 ring-[var(--surface-strong)] text-[10px] font-medium text-[var(--sea-ink-soft)]">
                +{team.members.length - 4}
              </div>
            )}
          </div>
          <span className="text-xs text-[var(--sea-ink-soft)]">{team.members.length} miembros</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Crown className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs text-[var(--sea-ink-soft)]">{team.manager.name}</span>
          <Badge variant="manager" className="ml-auto">Manager</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Team chat panel ──────────────────────────────────────────────────────────
function TeamChat({ team }: { team: Team }) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Listen for real-time chat messages from socket
  useEffect(() => {
    const socket = getSocket()
    const handler = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg])
    }
    socket.on(`team:${team._id}:message`, handler)
    return () => { socket.off(`team:${team._id}:message`, handler) }
  }, [team._id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    const content = input.trim()
    if (!content || !user) return

    // Optimistic message
    const optimistic: ChatMessage = {
      _id: `tmp-${Date.now()}`,
      author: user,
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])
    setInput('')

    // Fire & forget to backend
    teamService.sendChatMessage(team._id, content).catch(() => {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id))
    })
  }

  return (
    <Card className="flex flex-col h-full max-h-[480px]">
      <CardHeader className="p-4 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-[var(--lagoon-deep)]" />
          <CardTitle className="text-sm">Canal del equipo</CardTitle>
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            En línea
          </span>
        </div>
      </CardHeader>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.author._id === user?._id || msg.author.name === 'Tú'
          return (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
            >
              {!isMe && <Avatar name={msg.author.name} size="xs" />}
              <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isMe && (
                  <span className="text-[10px] text-[var(--sea-ink-soft)] ml-1">{msg.author.name}</span>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    isMe
                      ? 'bg-[var(--lagoon-deep)] text-white rounded-br-sm'
                      : 'bg-[var(--surface)] border border-[var(--line)] text-[var(--sea-ink)] rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-[var(--sea-ink-soft)] mx-1">
                  {formatRelativeTime(msg.createdAt)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--line)] p-3 flex gap-2">
        <Input
          placeholder="Escribe un mensaje…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          className="flex-1"
        />
        <Button size="icon" onClick={sendMessage} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
function TeamsPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: teamService.getAll,
    placeholderData: MOCK_TEAMS,
  })

  const teams = teamsData ?? MOCK_TEAMS
  const selectedTeam = teams.find((t) => t._id === selectedTeamId) ?? teams[0] ?? null

  return (
    <div>
      <TopBar title="Equipos" subtitle="Colabora y comunícate con tu equipo" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Equipos', value: teams.length, icon: <Users className="h-4 w-4" />, color: '#4fb8b2' },
            { label: 'Miembros totales', value: teams.reduce((a, t) => a + t.members.length, 0), icon: <UserPlus className="h-4 w-4" />, color: '#3b82f6' },
            { label: 'Satisfacción media', value: '87%', icon: <TrendingUp className="h-4 w-4" />, color: '#10b981' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${stat.color}18`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xl font-bold text-[var(--sea-ink)]">{stat.value}</p>
                  <p className="text-xs text-[var(--sea-ink-soft)]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Team list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--sea-ink)]">Tus equipos</h2>
              <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                Nuevo equipo
              </Button>
            </div>

            {teams.length === 0 ? (
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="Sin equipos"
                description="Todavía no perteneces a ningún equipo."
              />
            ) : (
              <div className="space-y-3">
                {teams.map((team) => (
                  <TeamCard
                    key={team._id}
                    team={team}
                    selected={selectedTeam?._id === team._id}
                    onSelect={() => setSelectedTeamId(team._id)}
                  />
                ))}
              </div>
            )}

            {/* Team metrics card */}
            {selectedTeam && (
              <Card>
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[var(--lagoon-deep)]" />
                    <CardTitle className="text-sm">Métricas — {selectedTeam.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4 space-y-3">
                  {[
                    { label: 'Feedback positivo', value: 78, color: '#10b981' },
                    { label: 'Objetivos completados', value: 65, color: '#3b82f6' },
                    { label: 'Participación', value: 91, color: '#4fb8b2' },
                  ].map((metric) => (
                    <div key={metric.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--sea-ink-soft)]">{metric.label}</span>
                        <span className="font-semibold text-[var(--sea-ink)]">{metric.value}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${metric.value}%`, background: metric.color }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Team chat */}
          {selectedTeam ? (
            <TeamChat team={selectedTeam} />
          ) : (
            <EmptyState
              icon={<MessageCircle className="h-6 w-6" />}
              title="Selecciona un equipo"
              description="Elige un equipo para ver el canal de chat"
            />
          )}
        </div>

        {/* Members of selected team */}
        {selectedTeam && (
          <Card>
            <CardHeader className="p-5">
              <CardTitle>Miembros de {selectedTeam.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selectedTeam.members.map((member) => (
                  <div
                    key={member.user._id}
                    className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3"
                  >
                    <Avatar name={member.user.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--sea-ink)]">
                        {member.user.name}
                        {member.user._id === selectedTeam.manager._id && (
                          <Crown className="ml-1.5 inline h-3 w-3 text-amber-500" />
                        )}
                      </p>
                      <p className="text-xs text-[var(--sea-ink-soft)]">{member.user.department ?? 'Sin departamento'}</p>
                    </div>
                    <Badge variant={member.role}>{member.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Missing import
function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  )
}
