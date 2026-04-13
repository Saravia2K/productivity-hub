import type { ObjectiveStatus } from '#/types'

export const OBJECTIVE_COLUMNS: { id: ObjectiveStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'Por hacer', color: '#94a3b8' },
  { id: 'in-progress', label: 'En progreso', color: '#3b82f6' },
  { id: 'in-review', label: 'En revisión', color: '#f59e0b' },
  { id: 'completed', label: 'Completado', color: '#10b981' },
]

export const OBJECTIVE_STATUS_COLORS: Record<ObjectiveStatus, string> = {
  todo: '#94a3b8',
  'in-progress': '#3b82f6',
  'in-review': '#f59e0b',
  completed: '#10b981',
}

export const OBJECTIVE_STATUS_LABELS: Record<ObjectiveStatus, string> = {
  todo: 'Por hacer',
  'in-progress': 'En progreso',
  'in-review': 'En revisión',
  completed: 'Completado',
}
