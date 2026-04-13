import type { FeedbackCategory } from '#/types'

export const FEEDBACK_CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
  { value: 'communication', label: 'Comunicación' },
  { value: 'leadership', label: 'Liderazgo' },
  { value: 'technical', label: 'Técnica' },
  { value: 'collaboration', label: 'Colaboración' },
]

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  communication: 'Comunicación',
  leadership: 'Liderazgo',
  technical: 'Técnica',
  collaboration: 'Colaboración',
}
