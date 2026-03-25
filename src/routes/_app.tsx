import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { Sidebar } from '#/components/layout/Sidebar'
import { useSocket } from '#/hooks/useSocket'

export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    // Server-safe auth guard — localStorage is only available in the browser
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('accessToken')
    if (!token) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  // Connect to real-time events for the authenticated session
  useSocket()

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
