import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

import { useGetCurrentUser } from './useGetCurrentUser'

const query = apiClient.organizationMemberships.getOrganizationMemberships()

type Props = {
  enabled?: boolean
}

export function useGetOrganizationMemberships(options?: Props) {
  const { data: currentUser } = useGetCurrentUser()
  const enabled = (options?.enabled ?? true) && !!currentUser?.logged_in

  return useQuery({
    queryKey: query.requestKey(),
    queryFn: () => query.request(),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled
  })
}
