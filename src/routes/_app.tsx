import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useState } from 'react'
import { Sidebar } from '#/components/layout/Sidebar'
import { useSocket } from '#/hooks/useSocket'

export const Route = createFileRoute('/_app')({
  component: AppGuard,
})

function AppGuard() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  if (!token) return <Navigate to="/login" replace />
  return <AppLayout />
}

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  // Connect to real-time events for the authenticated session
  useSocket()

  return (
    <div className="flex h-screen overflow-hidden bg-(--bg-base)">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
