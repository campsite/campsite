import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { getNormalizedData } from '@/utils/queryNormalization'

interface Props {
  threadId?: string | null
}

const query = apiClient.organizations.getThreadsById()

export function useGetThread({ threadId }: Props) {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, `${threadId}`),
    queryFn: async () => query.request(`${scope}`, `${threadId}`),
    enabled: !!threadId,
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000,
    placeholderData: () => getNormalizedData({ queryNormalizer, type: 'thread', id: `${threadId}` })
  })
}
