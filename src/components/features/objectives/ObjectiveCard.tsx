import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar, MessageCircle, CheckSquare, Clock } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { Avatar } from '#/components/ui/avatar'
import { ProgressBar } from '#/components/ui/progress-bar'
import { formatDate, cn } from '#/lib/utils'
import type { Objective } from '#/types'

interface ObjectiveCardProps {
  objective: Objective
  overlay?: boolean
  onClick?: () => void
}

export function ObjectiveCard({ objective, overlay = false, onClick }: ObjectiveCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: objective._id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  const completedSubTasks = objective.subTasks.filter((s) => s.completed).length
  const isOverdue =
    objective.dueDate &&
    new Date(objective.dueDate) < new Date() &&
    objective.status !== 'completed'

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={cn(
          'select-none',
          overlay && 'rotate-1 shadow-xl',
          isDragging && 'ring-2 ring-(--lagoon-deep)',
          !overlay && onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        )}
        onClick={!isDragging && !overlay ? onClick : undefined}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            <button
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 shrink-0 cursor-grab text-(--sea-ink-soft) opacity-40 hover:opacity-100 active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <p className="text-sm font-medium text-(--sea-ink) leading-snug flex-1">
              {objective.title}
            </p>
          </div>

          {objective.description && (
            <p className="ml-6 text-xs text-(--sea-ink-soft) line-clamp-2 leading-relaxed">
              {objective.description}
            </p>
          )}

          <div className="ml-6 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Avatar name={objective.assignee.name} size="xs" />
              <span className="text-xs text-(--sea-ink-soft)">{objective.assignee.name}</span>
            </div>

            {objective.dueDate && (
              <span
                className={cn(
                  'flex items-center gap-1 text-xs',
                  isOverdue ? 'text-red-500' : 'text-(--sea-ink-soft)',
                )}
              >
                {isOverdue ? (
                  <Clock className="h-3 w-3" />
                ) : (
                  <Calendar className="h-3 w-3" />
                )}
                {formatDate(objective.dueDate)}
              </span>
            )}

            {objective.subTasks.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-(--sea-ink-soft)">
                <CheckSquare className="h-3 w-3" />
                {completedSubTasks}/{objective.subTasks.length}
              </span>
            )}

            {objective.comments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-(--sea-ink-soft)">
                <MessageCircle className="h-3 w-3" />
                {objective.comments.length}
              </span>
            )}
          </div>

          {objective.subTasks.length > 0 && (
            <div className="ml-6">
              <ProgressBar
                value={completedSubTasks}
                max={objective.subTasks.length}
                color="var(--lagoon-deep)"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
