import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

const query = apiClient.users.getMeOrganizationInvitations()

export function useGetCurrentUserOrganizationInvitations() {
  return useQuery({
    queryKey: query.requestKey(),
    queryFn: () => query.request()
  })
}
