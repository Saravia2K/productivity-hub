import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { TopBar } from '#/components/layout/TopBar'
import { Button } from '#/components/ui/button'
import { PageSpinner } from '#/components/ui/spinner'
import { ObjectiveCard } from '#/components/features/objectives/ObjectiveCard'
import { KanbanColumn } from '#/components/features/objectives/KanbanColumn'
import { CreateObjectiveDialog } from '#/components/features/objectives/CreateObjectiveDialog'
import { EditObjectiveDialog } from '#/components/features/objectives/EditObjectiveDialog'
import { objectiveService } from '#/services/objective.service'
import { OBJECTIVE_COLUMNS } from '#/constants/objectives'
import type { Objective, ObjectiveStatus } from '#/types'

export const Route = createFileRoute('/_app/objectives')({
  component: ObjectivesPage,
})

function ObjectivesPage() {
  const qc = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState<ObjectiveStatus>('todo')
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['objectives'],
    queryFn: () => objectiveService.getAll({ limit: 100 }),
  })

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ObjectiveStatus }) =>
      objectiveService.updateStatus(id, status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['objectives'] }),
  })

  const objectives = data?.data ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const getColumn = useCallback(
    (id: string): ObjectiveStatus | null => {
      const obj = objectives.find((o) => o._id === id)
      return obj?.status ?? null
    },
    [objectives],
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const activeObj = objectives.find((o) => o._id === active.id)
    if (!activeObj) return

    const targetStatus = (OBJECTIVE_COLUMNS.some((c) => c.id === over.id)
      ? over.id
      : getColumn(over.id as string)) as ObjectiveStatus | null

    if (targetStatus && targetStatus !== activeObj.status) {
      qc.setQueryData<typeof data>(['objectives'], (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((o) =>
            o._id === active.id ? { ...o, status: targetStatus } : o,
          ),
        }
      })
      updateStatus({ id: activeObj._id, status: targetStatus })
    }
  }

  const activeObjective = activeId ? objectives.find((o) => o._id === activeId) : null

  const openAdd = (status: ObjectiveStatus) => {
    setDefaultStatus(status)
    setDialogOpen(true)
  }

  if (isLoading && !data) return <PageSpinner />

  return (
    <div>
      <TopBar
        title="Tablero de Objetivos"
        subtitle="Gestiona y prioriza los objetivos del equipo"
      />

      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-3">
            {OBJECTIVE_COLUMNS.map((col) => {
              const count = objectives.filter((o) => o.status === col.id).length
              return (
                <div
                  key={col.id}
                  className="flex items-center gap-1.5 text-xs text-(--sea-ink-soft)"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: col.color }} />
                  <span>{col.label}:</span>
                  <span className="font-semibold text-(--sea-ink)">{count}</span>
                </div>
              )
            })}
          </div>
          <Button
            onClick={() => openAdd('todo')}
            leftIcon={<Plus className="h-4 w-4" />}
            size="sm"
          >
            Nuevo objetivo
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {OBJECTIVE_COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                status={col.id}
                label={col.label}
                color={col.color}
                objectives={objectives.filter((o) => o.status === col.id)}
                onAdd={() => openAdd(col.id)}
                onEdit={setEditingObjective}
              />
            ))}
          </div>

          <DragOverlay>
            {activeObjective && <ObjectiveCard objective={activeObjective} overlay />}
          </DragOverlay>
        </DndContext>
      </div>

      <CreateObjectiveDialog
        open={dialogOpen}
        defaultStatus={defaultStatus}
        onClose={() => setDialogOpen(false)}
      />
      <EditObjectiveDialog
        objective={editingObjective}
        onClose={() => setEditingObjective(null)}
      />
    </div>
  )
}
