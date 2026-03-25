import * as React from 'react'
import { cn } from '#/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export function Card({ hoverable = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--line)]',
        'bg-gradient-to-b from-[var(--surface-strong)] to-[var(--surface)]',
        'shadow-[0_1px_0_var(--inset-glint)_inset,0_4px_16px_rgba(23,58,64,0.06)]',
        hoverable &&
          'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_0_var(--inset-glint)_inset,0_8px_24px_rgba(23,58,64,0.1)] cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-1 p-5 pb-0', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-semibold text-[var(--sea-ink)] leading-tight', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-[var(--sea-ink-soft)]', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 border-t border-[var(--line)] px-5 py-3',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
