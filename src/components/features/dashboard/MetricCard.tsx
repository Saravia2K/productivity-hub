import { TrendingUp } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'

interface MetricCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
  trend?: string
}

export function MetricCard({ label, value, icon, color, trend }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-(--sea-ink-soft)">
              {label}
            </p>
            <p className="text-3xl font-bold text-(--sea-ink)">{value}</p>
            {trend && (
              <p className="flex items-center gap-1 text-xs text-(--sea-ink-soft)">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                {trend}
              </p>
            )}
          </div>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: `${color}18`, color }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
