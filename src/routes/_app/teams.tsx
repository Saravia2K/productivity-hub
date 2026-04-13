import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, MessageCircle, UserPlus, TrendingUp, Plus, BarChart3 } from 'lucide-react'
import { TopBar } from '#/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { EmptyState } from '#/components/ui/empty-state'
import { StatCard } from '#/components/ui/stat-card'
import { ProgressBar } from '#/components/ui/progress-bar'
import { Avatar } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { TeamCard } from '#/components/features/teams/TeamCard'
import { TeamChat } from '#/components/features/teams/TeamChat'
import { teamService } from '#/services/team.service'
import { Crown } from 'lucide-react'

export const Route = createFileRoute('/_app/teams')({
  component: TeamsPage,
})

const TEAM_METRICS = [
  { label: 'Feedback positivo', value: 78, color: '#10b981' },
  { label: 'Objetivos completados', value: 65, color: '#3b82f6' },
  { label: 'Participación', value: 91, color: '#1f9790' },
]

function TeamsPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: teamService.getAll,
  })

  const teams = teamsData ?? []
  const selectedTeam = teams.find((t) => t._id === selectedTeamId) ?? teams[0] ?? null

  const stats = [
    { label: 'Equipos', value: teams.length, icon: <Users className="h-4 w-4" />, color: '#1f9790' },
    { label: 'Miembros totales', value: teams.reduce((a, t) => a + t.members.length, 0), icon: <UserPlus className="h-4 w-4" />, color: '#3b82f6' },
    { label: 'Satisfacción media', value: '87%', icon: <TrendingUp className="h-4 w-4" />, color: '#10b981' },
  ]

  return (
    <div>
      <TopBar title="Equipos" subtitle="Colabora y comunícate con tu equipo" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-(--sea-ink)">Tus equipos</h2>
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

            {selectedTeam && (
              <Card>
                <CardHeader className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-(--lagoon-deep)" />
                    <CardTitle className="text-sm">Métricas — {selectedTeam.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4 space-y-3">
                  {TEAM_METRICS.map((metric) => (
                    <div key={metric.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-(--sea-ink-soft)">{metric.label}</span>
                        <span className="font-semibold text-(--sea-ink)">{metric.value}%</span>
                      </div>
                      <ProgressBar value={metric.value} color={metric.color} height="md" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

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
                    className="flex items-center gap-3 rounded-xl border border-(--line) p-3"
                  >
                    <Avatar name={member.user.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-(--sea-ink)">
                        {member.user.name}
                        {member.user._id === selectedTeam.manager._id && (
                          <Crown className="ml-1.5 inline h-3 w-3 text-amber-500" />
                        )}
                      </p>
                      <p className="text-xs text-(--sea-ink-soft)">
                        {member.user.department ?? 'Sin departamento'}
                      </p>
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
