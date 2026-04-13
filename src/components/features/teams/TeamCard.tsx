import { Users, Crown } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Avatar } from '#/components/ui/avatar'
import type { Team } from '#/types'

interface TeamCardProps {
  team: Team
  selected: boolean
  onSelect: () => void
}

export function TeamCard({ team, selected, onSelect }: TeamCardProps) {
  return (
    <Card
      hoverable
      onClick={onSelect}
      className={selected ? 'border-(--lagoon-deep) ring-1 ring-(--lagoon-deep)' : ''}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-(--sea-ink)">{team.name}</h3>
            {team.description && (
              <p className="text-xs text-(--sea-ink-soft) mt-0.5">{team.description}</p>
            )}
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--lagoon-tint-10)]">
            <Users className="h-4 w-4 text-(--lagoon-deep)" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {team.members.slice(0, 4).map((m) => (
              <Avatar
                key={m.user._id}
                name={m.user.name}
                size="xs"
                className="ring-2 ring-(--surface-strong)"
              />
            ))}
            {team.members.length > 4 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-(--surface) ring-2 ring-(--surface-strong) text-[10px] font-medium text-(--sea-ink-soft)">
                +{team.members.length - 4}
              </div>
            )}
          </div>
          <span className="text-xs text-(--sea-ink-soft)">{team.members.length} miembros</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Crown className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs text-(--sea-ink-soft)">{team.manager.name}</span>
          <Badge variant="manager" className="ml-auto">Manager</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
