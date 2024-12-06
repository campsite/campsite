import { useQuery } from '@tanstack/react-query'

import { PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { getNormalizedData } from '@/utils/queryNormalization'

const query = apiClient.organizations.getPostsByPostId()

interface Options {
  postId?: string | null
  organization?: PublicOrganization
  refetchOnWindowFocus?: boolean
  enabled?: boolean
  fetchIfStale?: boolean
}

export function useGetPost(options?: Options) {
  const refetchOnWindowFocus = (options?.enabled && options?.refetchOnWindowFocus) ?? false
  const { scope } = useScope()
  const orgSlug = options?.organization?.slug || `${scope}`
  const id = `${options?.postId}`
  const queryNormalizer = useQueryNormalizer()

  return useQuery({
    queryKey: query.requestKey(orgSlug, id),
    queryFn: () => query.request(orgSlug, id),
    enabled: !!orgSlug && !!options?.postId && (options?.enabled ?? true),
    refetchOnWindowFocus,
    placeholderData: () => getNormalizedData({ queryNormalizer, type: 'post', id })
  })
}
