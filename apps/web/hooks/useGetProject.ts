import { useQuery } from '@tanstack/react-query'

import { PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { getNormalizedData } from '@/utils/queryNormalization'

const query = apiClient.organizations.getProjectsByProjectId()

export function useGetProject({
  id,
  enabled = true,
  organization
}: {
  id?: string
  enabled?: boolean
  organization?: PublicOrganization
}) {
  const { scope } = useScope()
  const orgSlug = organization?.slug || `${scope}`
  const queryNormalizer = useQueryNormalizer()

  return useQuery({
    queryKey: query.requestKey(orgSlug, `${id}`),
    queryFn: () => query.request(orgSlug, `${id}`),
    enabled: enabled && !!scope && !!id,
    placeholderData: () => getNormalizedData({ queryNormalizer, type: 'project', id: `${id}` })
  })
}
