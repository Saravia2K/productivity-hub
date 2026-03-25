import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (typeof window === 'undefined') return

    const token = localStorage.getItem('accessToken')
    throw redirect({ to: token ? '/dashboard' : '/login' })
  },
  component: () => null,
})
