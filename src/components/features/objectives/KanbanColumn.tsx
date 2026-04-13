import { Plus } from 'lucide-react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { ObjectiveCard } from '#/components/features/objectives/ObjectiveCard'
import { cn } from '#/lib/utils'
import type { Objective, ObjectiveStatus } from '#/types'

interface KanbanColumnProps {
  status: ObjectiveStatus
  label: string
  color: string
  objectives: Objective[]
  onAdd: () => void
  onEdit: (obj: Objective) => void
}

export function KanbanColumn({
  status,
  label,
  color,
  objectives,
  onAdd,
  onEdit,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col gap-3 min-w-[280px] flex-1">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          <span className="text-sm font-semibold text-(--sea-ink)">{label}</span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-(--surface) border border-(--line) px-1.5 text-xs font-medium text-(--sea-ink-soft)">
            {objectives.length}
          </span>
        </div>
        <button
          onClick={onAdd}
          className="rounded-lg p-1 text-(--sea-ink-soft) transition-colors hover:bg-(--surface) hover:text-(--sea-ink)"
          title="Añadir objetivo"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <SortableContext
        items={objectives.map((o) => o._id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            'flex flex-col gap-2 rounded-2xl border-2 border-dashed p-2 min-h-[200px] transition-colors',
            isOver ? 'border-(--lagoon-deep) bg-(--lagoon-tint-4)' : 'border-(--line)',
          )}
        >
          {objectives.map((obj) => (
            <ObjectiveCard key={obj._id} objective={obj} onClick={() => onEdit(obj)} />
          ))}
          {objectives.length === 0 && (
            <div className="flex flex-1 items-center justify-center py-8">
              <p className="text-xs text-(--sea-ink-soft)">Arrastra objetivos aquí</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
