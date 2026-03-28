import { createFileRoute, Navigate } from '@tanstack/react-router'

function IndexRedirect() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return <Navigate to={token ? '/dashboard' : '/login'} replace />
}

export const Route = createFileRoute('/')({
  component: IndexRedirect,
})
