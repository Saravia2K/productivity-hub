import { Search, Bell } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useNotificationStore } from '#/stores/notification.store'
import ThemeToggle from '#/components/ThemeToggle'
import { cn } from '#/lib/utils'

interface TopBarProps {
  title: string
  subtitle?: string
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const { unreadCount } = useNotificationStore()

  return (
    <header
      className={cn(
        'flex h-16 items-center justify-between border-b border-[var(--line)] px-6',
        'bg-[var(--header-bg)] backdrop-blur-md',
      )}
    >
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-[var(--sea-ink)] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[var(--sea-ink-soft)]">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search placeholder */}
        <button className="flex h-8 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-sm text-[var(--sea-ink-soft)] transition-colors hover:border-[var(--lagoon-deep)] hover:text-[var(--sea-ink)]">
          <Search className="h-3.5 w-3.5" />
          <span className="hidden text-xs sm:block">Buscar…</span>
        </button>

        {/* Notifications bell */}
        <Link
          to="/notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink-soft)] transition-colors hover:text-[var(--sea-ink)]"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--lagoon-deep)] text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <ThemeToggle />
      </div>
    </header>
  )
}
