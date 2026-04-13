import { useQuery } from '@tanstack/react-query'
import { userService } from '#/services/user.service'

export function useUsersQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['users-list'],
    queryFn: () => userService.getAll({ limit: 100 }),
    enabled,
  })
}
