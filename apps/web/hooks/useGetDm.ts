import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getThreadsDmByUsername = apiClient.organizations.getThreadsDmsByUsername()

export function useGetDm({ username }: { username: string }) {
  const { scope } = useScope()

  return useQuery({
    queryKey: getThreadsDmByUsername.requestKey(`${scope}`, username),
    queryFn: () => getThreadsDmByUsername.request(`${scope}`, username),
    enabled: !!scope
  })
}
