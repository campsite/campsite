import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getProjectsBookmarks()

export function useGetProjectBookmarks({ projectId }: { projectId: string }) {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, projectId),
    queryFn: () => query.request(`${scope}`, projectId)
  })
}
