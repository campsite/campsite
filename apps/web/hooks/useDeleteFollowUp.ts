import { useMutation, useQueryClient } from '@tanstack/react-query'

import { FollowUp, PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { handleFollowUpDelete } from '@/utils/optimisticFollowUps'
import { apiClient } from '@/utils/queryClient'

const deleteFollowUpsById = apiClient.organizations.deleteFollowUpsById()
const getFollowUps = apiClient.organizations.getFollowUps()

export function useDeleteFollowUp({ organization }: { organization?: PublicOrganization } = {}) {
  const { scope } = useScope()
  const orgSlug = organization?.slug || `${scope}`
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: (followUp: FollowUp) => deleteFollowUpsById.request(orgSlug, followUp.id),
    onMutate(followUp: FollowUp) {
      return handleFollowUpDelete({
        queryClient,
        queryNormalizer,
        followUpId: followUp.id,
        subjectId: followUp.subject.id,
        subjectType: followUp.subject.type
      })
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: getFollowUps.requestKey({ orgSlug: `${scope}` }) })
    }
  })
}
