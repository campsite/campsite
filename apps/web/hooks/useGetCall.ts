import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { getNormalizedData } from '@/utils/queryNormalization'

type Props = {
  id?: string
  enabled?: boolean
}

const query = apiClient.organizations.getCallsById()

export function useGetCall({ id, enabled = true }: Props) {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, `${id}`),
    queryFn: () => query.request(`${scope}`, `${id}`),
    enabled: !!id && enabled,
    placeholderData: () => getNormalizedData({ queryNormalizer, type: 'call', id: `${id}` })
  })
}
