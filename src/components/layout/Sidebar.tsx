import { Link, useRouterState } from '@tanstack/react-router'
import {
  BarChart3,
  MessageSquarePlus,
  KanbanSquare,
  Users,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { useAuth } from '#/hooks/useAuth'
import { useAuthStore } from '#/stores/auth.store'
import { useNotificationStore } from '#/stores/notification.store'
import { Avatar } from '#/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  adminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <BarChart3 className="h-5 w-5" /> },
  { label: 'Feedback', to: '/feedback', icon: <MessageSquarePlus className="h-5 w-5" /> },
  { label: 'Objetivos', to: '/objectives', icon: <KanbanSquare className="h-5 w-5" /> },
  { label: 'Equipos', to: '/teams', icon: <Users className="h-5 w-5" /> },
  { label: 'Notificaciones', to: '/notifications', icon: <Bell className="h-5 w-5" /> },
]

const BOTTOM_ITEMS: NavItem[] = [
  { label: 'Admin', to: '/admin', icon: <ShieldCheck className="h-5 w-5" />, adminOnly: true },
  { label: 'Configuración', to: '/settings', icon: <Settings className="h-5 w-5" /> },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotificationStore()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const isActive = (to: string) =>
    currentPath === to || (to !== '/dashboard' && currentPath.startsWith(to))

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r border-[var(--line)]',
        'bg-gradient-to-b from-[var(--sea-ink)] to-[#0e2a31]',
        'transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-white/10 px-4',
          collapsed ? 'justify-center' : 'gap-3',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--lagoon)] to-[var(--lagoon-deep)]">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-white tracking-tight">
            TeamSync
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 pt-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.to)
          const isNotifications = item.to === '/notifications'

          const linkContent = (
            <Link
              to={item.to}
              className={cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                'transition-all duration-150',
                collapsed ? 'justify-center' : '',
                active
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90',
              )}
            >
              <span className="relative shrink-0">
                {item.icon}
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--lagoon)] text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )

          return collapsed ? (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            <div key={item.to}>{linkContent}</div>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col gap-1 border-t border-white/10 p-2 pb-3">
        {BOTTOM_ITEMS.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null
          const active = isActive(item.to)

          const linkContent = (
            <Link
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                'transition-all duration-150',
                collapsed ? 'justify-center' : '',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90',
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )

          return collapsed ? (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ) : (
            <div key={item.to}>{linkContent}</div>
          )
        })}

        {/* User info + logout */}
        <div
          className={cn(
            'mt-1 flex items-center rounded-xl px-3 py-2',
            'bg-white/5',
            collapsed ? 'justify-center' : 'gap-3',
          )}
        >
          <Avatar name={user?.name ?? 'U'} src={user?.avatar} size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
              <p className="truncate text-[10px] text-white/50">{user?.role}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="rounded-lg p-1 text-white/40 transition-colors hover:text-white/80"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-20 z-10',
          'flex h-6 w-6 items-center justify-center rounded-full',
          'border border-[var(--line)] bg-[var(--surface-strong)] shadow-sm',
          'text-[var(--sea-ink-soft)] transition-colors hover:text-[var(--sea-ink)]',
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  )
}
