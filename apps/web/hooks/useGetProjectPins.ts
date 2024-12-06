import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getProjectsPins()

export function useGetProjectPins({ id }: { id: string }) {
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, `${id}`),
    queryFn: () => query.request(`${scope}`, `${id}`),
    placeholderData: keepPreviousData
  })
}
