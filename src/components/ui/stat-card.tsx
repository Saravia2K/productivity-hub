import { Card, CardContent } from '#/components/ui/card'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
  iconVariant?: 'tinted' | 'solid'
  size?: 'sm' | 'md'
}

export function StatCard({
  label,
  value,
  icon,
  color,
  iconVariant = 'tinted',
  size = 'sm',
}: StatCardProps) {
  const iconSizeClass = size === 'md' ? 'h-10 w-10' : 'h-9 w-9'
  const valueSizeClass = size === 'md' ? 'text-2xl' : 'text-xl'

  const iconStyle =
    iconVariant === 'solid'
      ? { background: color }
      : { background: `${color}18`, color }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div
          className={`flex ${iconSizeClass} shrink-0 items-center justify-center rounded-xl`}
          style={iconStyle}
        >
          {icon}
        </div>
        <div>
          <p className={`${valueSizeClass} font-bold text-(--sea-ink)`}>{value}</p>
          <p className="text-xs text-(--sea-ink-soft)">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
