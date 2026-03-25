import { cn } from '#/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      role="status"
      className={cn(
        'inline-block animate-spin rounded-full',
        'border-2 border-current border-t-transparent text-[var(--lagoon-deep)]',
        sizeClasses[size],
        className,
      )}
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}
