import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  GripVertical,
  Calendar,
  MessageCircle,
  CheckSquare,
  Clock,
} from 'lucide-react'
import { TopBar } from '#/components/layout/TopBar'
import { Card, CardContent } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Avatar } from '#/components/ui/avatar'
import { Input, Textarea } from '#/components/ui/input'
import { Select } from '#/components/ui/select'
import { PageSpinner } from '#/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '#/components/ui/dialog'
import { objectiveService } from '#/services/objective.service'
import { userService } from '#/services/user.service'
import { formatDate } from '#/lib/utils'
import { cn } from '#/lib/utils'
import type { CreateObjectiveDto, Objective, ObjectiveStatus } from '#/types'

export const Route = createFileRoute('/_app/objectives')({
  component: ObjectivesPage,
})

// ─── Column config ────────────────────────────────────────────────────────────
const COLUMNS: { id: ObjectiveStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'Por hacer', color: '#94a3b8' },
  { id: 'in-progress', label: 'En progreso', color: '#3b82f6' },
  { id: 'in-review', label: 'En revisión', color: '#f59e0b' },
  { id: 'completed', label: 'Completado', color: '#10b981' },
]

// ─── Sortable objective card ──────────────────────────────────────────────────
function ObjectiveCard({
  objective,
  overlay = false,
}: {
  objective: Objective
  overlay?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: objective._id })

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
        )}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            <button
              {...attributes}
              {...listeners}
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
            {/* Assignee */}
            <div className="flex items-center gap-1.5">
              <Avatar name={objective.assignee.name} size="xs" />
              <span className="text-xs text-(--sea-ink-soft)">
                {objective.assignee.name}
              </span>
            </div>

            {/* Due date */}
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

            {/* Sub-tasks progress */}
            {objective.subTasks.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-(--sea-ink-soft)">
                <CheckSquare className="h-3 w-3" />
                {completedSubTasks}/{objective.subTasks.length}
              </span>
            )}

            {/* Comments */}
            {objective.comments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-(--sea-ink-soft)">
                <MessageCircle className="h-3 w-3" />
                {objective.comments.length}
              </span>
            )}
          </div>

          {/* Sub-task progress bar */}
          {objective.subTasks.length > 0 && (
            <div className="ml-6">
              <div className="h-1 w-full overflow-hidden rounded-full bg-(--line)">
                <div
                  className="h-full rounded-full bg-(--lagoon-deep) transition-all duration-300"
                  style={{
                    width: `${(completedSubTasks / objective.subTasks.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Kanban column ────────────────────────────────────────────────────────────
function KanbanColumn({
  status,
  label,
  color,
  objectives,
  onAdd,
}: {
  status: ObjectiveStatus
  label: string
  color: string
  objectives: Objective[]
  onAdd: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col gap-3 min-w-[280px] flex-1">
      {/* Column header */}
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

      {/* Drop zone */}
      <SortableContext
        items={objectives.map((o) => o._id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            'flex flex-col gap-2 rounded-2xl border-2 border-dashed p-2 min-h-[200px]',
            isOver ? 'border-(--lagoon-deep) bg-[var(--lagoon-tint-4)]' : 'border-(--line)',
            'transition-colors',
          )}
        >
          {objectives.map((obj) => (
            <ObjectiveCard key={obj._id} objective={obj} />
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

// ─── Create objective dialog ──────────────────────────────────────────────────
type CreateObjectiveForm = {
  title: string
  description: string
  status: ObjectiveStatus
  assignee: string
  dueDate: string
}

function CreateObjectiveDialog({
  open,
  defaultStatus,
  onClose,
}: {
  open: boolean
  defaultStatus: ObjectiveStatus
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [serverError, setServerError] = useState('')

  const { data: usersData } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => userService.getAll({ limit: 100 }),
    enabled: open,
  })
  const assigneeOptions = (usersData?.data ?? []).map((u) => ({
    value: u._id,
    label: u.name + (u.department ? ` · ${u.department}` : ''),
  }))

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateObjectiveForm>({
    defaultValues: { title: '', description: '', status: defaultStatus, assignee: '', dueDate: '' },
  })

  useEffect(() => {
    if (open) reset({ title: '', description: '', status: defaultStatus, assignee: '', dueDate: '' })
  }, [open, defaultStatus, reset])

  const { mutateAsync } = useMutation({
    mutationFn: objectiveService.create,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['objectives'] })
      onClose()
    },
  })

  async function onSubmit(data: CreateObjectiveForm) {
    setServerError('')
    try {
      await mutateAsync({ ...data, dueDate: data.dueDate || undefined } as CreateObjectiveDto)
    } catch {
      setServerError('No se pudo crear el objetivo.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo objetivo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody className="space-y-4">
            <Input
              label="Título"
              placeholder="¿Qué quieres lograr?"
              error={errors.title?.message}
              {...register('title', { required: 'El título es obligatorio.' })}
            />
            <Textarea
              label="Descripción (opcional)"
              placeholder="Contexto adicional…"
              rows={3}
              {...register('description')}
            />
            <Controller
              control={control}
              name="assignee"
              rules={{ required: 'Selecciona un responsable.' }}
              render={({ field }) => (
                <Select
                  label="Responsable"
                  options={assigneeOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Asignar a…"
                  error={errors.assignee?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  label="Estado inicial"
                  options={COLUMNS.map((c) => ({ value: c.id, label: c.label }))}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
            <Input
              label="Fecha límite (opcional)"
              type="date"
              leftIcon={<Calendar className="h-4 w-4" />}
              {...register('dueDate')}
            />
            {serverError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {serverError}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={isSubmitting} leftIcon={<Plus className="h-4 w-4" />}>
              Crear objetivo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
function ObjectivesPage() {
  const qc = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState<ObjectiveStatus>('todo')

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

    // Determine target column: over could be a column id or another card's id
    const targetStatus = (COLUMNS.some((c) => c.id === over.id)
      ? over.id
      : getColumn(over.id as string)) as ObjectiveStatus | null

    if (targetStatus && targetStatus !== activeObj.status) {
      // Optimistic update via queryClient
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
            {COLUMNS.map((col) => {
              const count = objectives.filter((o) => o.status === col.id).length
              return (
                <div key={col.id} className="flex items-center gap-1.5 text-xs text-(--sea-ink-soft)">
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
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                status={col.id}
                label={col.label}
                color={col.color}
                objectives={objectives.filter((o) => o.status === col.id)}
                onAdd={() => openAdd(col.id)}
              />
            ))}
          </div>

          {/* Drag overlay — shows floating card while dragging */}
          <DragOverlay>
            {activeObjective && (
              <ObjectiveCard objective={activeObjective} overlay />
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <CreateObjectiveDialog
        open={dialogOpen}
        defaultStatus={defaultStatus}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  )
}
