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
import { SidebarNavItem } from '#/components/layout/SidebarNavItem'

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
        'relative flex h-full flex-col',
        'border-r border-(--sidebar-border)',
        'bg-gradient-to-b from-(--sidebar-bg-from) to-(--sidebar-bg-to)',
        'transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-(--sidebar-divider) px-4',
          collapsed ? 'justify-center' : 'gap-3',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1f9790] to-[#0c4f54]">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span
            className="text-sm font-bold tracking-tight"
            style={{ color: 'var(--sidebar-brand-text)' }}
          >
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
                active ? 'bg-(--sidebar-active-bg)' : 'hover:bg-(--sidebar-hover-bg)',
              )}
              style={{
                color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text-muted)',
              }}
            >
              <span className="relative shrink-0">
                {item.icon}
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#14696e] text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )

          return (
            <SidebarNavItem key={item.to} itemKey={item.to} label={item.label} collapsed={collapsed}>
              {linkContent}
            </SidebarNavItem>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col gap-1 border-t border-(--sidebar-divider) p-2 pb-3">
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
                active ? 'bg-(--sidebar-active-bg)' : 'hover:bg-(--sidebar-hover-bg)',
              )}
              style={{
                color: active ? 'var(--sidebar-active-text)' : 'var(--sidebar-text-muted)',
              }}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )

          return (
            <SidebarNavItem key={item.to} itemKey={item.to} label={item.label} collapsed={collapsed}>
              {linkContent}
            </SidebarNavItem>
          )
        })}

        {/* User info + logout */}
        <div
          className={cn(
            'mt-1 flex items-center rounded-xl px-3 py-2',
            'bg-(--sidebar-user-bg)',
            collapsed ? 'justify-center' : 'gap-3',
          )}
        >
          <Avatar name={user?.name ?? 'U'} src={user?.avatar} size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-xs font-semibold"
                style={{ color: 'var(--sidebar-text)' }}
              >
                {user?.name}
              </p>
              <p className="truncate text-[10px]" style={{ color: 'var(--sidebar-text-muted)' }}>
                {user?.role}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="rounded-lg p-1 transition-colors"
              style={{ color: 'var(--sidebar-text-muted)' }}
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
          'border border-(--line) bg-(--surface-strong) shadow-sm',
          'text-(--sea-ink-soft) transition-colors hover:text-(--sea-ink)',
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
