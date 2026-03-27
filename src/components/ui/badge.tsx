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
  default: 'bg-(--surface) text-(--sea-ink-soft) border-(--line)',
  positive: 'bg-[var(--badge-positive-bg)] text-[var(--badge-positive-text)] border-[var(--badge-positive-border)]',
  constructive: 'bg-[var(--badge-constructive-bg)] text-[var(--badge-constructive-text)] border-[var(--badge-constructive-border)]',
  warning: 'bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)] border-[var(--badge-warning-border)]',
  info: 'bg-[var(--lagoon-tint-12)] text-(--lagoon-deep) border-[var(--lagoon-tint-24)]',
  admin: 'bg-[var(--badge-admin-bg)] text-[var(--badge-admin-text)] border-[var(--badge-admin-border)]',
  manager: 'bg-[var(--badge-manager-bg)] text-[var(--badge-manager-text)] border-[var(--badge-manager-border)]',
  employee: 'bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)] border-[var(--badge-neutral-border)]',
  todo: 'bg-[var(--badge-neutral-bg)] text-[var(--badge-neutral-text)] border-[var(--badge-neutral-border)]',
  'in-progress': 'bg-[var(--badge-manager-bg)] text-[var(--badge-manager-text)] border-[var(--badge-manager-border)]',
  'in-review': 'bg-[var(--badge-constructive-bg)] text-[var(--badge-constructive-text)] border-[var(--badge-constructive-border)]',
  completed: 'bg-[var(--badge-positive-bg)] text-[var(--badge-positive-text)] border-[var(--badge-positive-border)]',
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
