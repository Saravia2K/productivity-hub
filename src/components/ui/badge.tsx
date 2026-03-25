import * as React from 'react'
import { cn } from '#/lib/utils'

type BadgeVariant =
  | 'default'
  | 'positive'
  | 'constructive'
  | 'warning'
  | 'info'
  | 'admin'
  | 'manager'
  | 'employee'
  | 'todo'
  | 'in-progress'
  | 'in-review'
  | 'completed'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--surface)] text-[var(--sea-ink-soft)] border-[var(--line)]',
  positive: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  constructive: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  warning: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  info: 'bg-[rgba(79,184,178,0.12)] text-[var(--lagoon-deep)] border-[rgba(79,184,178,0.25)]',
  admin: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  manager: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  employee: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  todo: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  'in-progress': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'in-review': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
