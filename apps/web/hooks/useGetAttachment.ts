import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { getNormalizedData } from '@/utils/queryNormalization'

const query = apiClient.organizations.getAttachmentsById()

export function useGetAttachment(id?: string | null, enabled: boolean = true) {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, `${id}`),
    queryFn: () => query.request(`${scope}`, `${id}`),
    enabled: enabled && !!id,
    placeholderData: () => getNormalizedData({ queryNormalizer, type: 'attachment', id: id ?? '' })
  })
}
