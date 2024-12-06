import { useQuery } from '@tanstack/react-query'

import { PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { getNormalizedData } from '@/utils/queryNormalization'

type Props = {
  id?: string
  enabled?: boolean
  organization?: PublicOrganization
}

const query = apiClient.organizations.getNotesById()

export function useGetNote({ id, enabled = true, organization }: Props) {
  const { scope } = useScope()
  const orgSlug = organization?.slug || `${scope}`
  const queryNormalizer = useQueryNormalizer()

  return useQuery({
    queryKey: query.requestKey(orgSlug, `${id}`),
    queryFn: () => query.request(orgSlug, `${id}`),
    enabled: enabled && !!id,
    placeholderData: () => getNormalizedData({ queryNormalizer, type: 'note', id: `${id}` })
  })
}
