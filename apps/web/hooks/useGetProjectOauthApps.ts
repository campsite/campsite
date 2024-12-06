import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getProjectsOauthApplications()

export function useGetProjectOauthApps({ projectId, enabled = true }: { projectId: string; enabled?: boolean }) {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, projectId),
    queryFn: () => query.request(`${scope}`, projectId),
    enabled
  })
}
