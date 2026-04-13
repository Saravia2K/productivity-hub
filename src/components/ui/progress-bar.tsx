interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  height?: 'sm' | 'md'
}

export function ProgressBar({ value, max = 100, color = 'var(--lagoon-deep)', height = 'sm' }: ProgressBarProps) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const heightClass = height === 'md' ? 'h-1.5' : 'h-1'

  return (
    <div className={`${heightClass} w-full overflow-hidden rounded-full bg-(--line)`}>
      <div
        className={`${heightClass} rounded-full transition-all duration-300`}
        style={{ width: `${percent}%`, background: color }}
      />
    </div>
  )
}
