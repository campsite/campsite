import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/utils/queryClient'

type Props = {
  org?: string
  enabled?: boolean
}

const query = apiClient.organizations.getByOrgSlug()

export function useGetOrganization(props?: Props) {
  const enabled = props?.enabled ?? true

  return useQuery({
    queryKey: query.requestKey(`${props?.org}`),
    queryFn: () => query.request(`${props?.org}`),
    enabled: enabled && !!props?.org,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}
