import { useMutation } from '@tanstack/react-query'

import { OrganizationsOrgSlugCallsIdPutRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

export function useUpdateCall({ id }: { id: string }) {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugCallsIdPutRequest) =>
      apiClient.organizations.putCallsById().request(`${scope}`, id, data),
    onMutate: (data) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'call',
        id,
        update: { ...data, processing_generated_title: false, is_edited: true }
      })
    }
  })
}
