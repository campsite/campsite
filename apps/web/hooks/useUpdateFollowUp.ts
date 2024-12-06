import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugFollowUpsIdPutRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { handleFollowUpUpdate } from '@/utils/optimisticFollowUps'
import { apiClient } from '@/utils/queryClient'

const putFollowUpsById = apiClient.organizations.putFollowUpsById()
const getFollowUps = apiClient.organizations.getFollowUps()

export function useUpdateFollowUp() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: OrganizationsOrgSlugFollowUpsIdPutRequest & { id: string; subjectId: string; subjectType: string }) =>
      putFollowUpsById.request(`${scope}`, id, data),
    onMutate({ id, subjectId, subjectType, ...data }) {
      return handleFollowUpUpdate({
        queryNormalizer,
        followUpId: id,
        subjectId,
        subjectType,
        updateData: data
      })
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: getFollowUps.requestKey({ orgSlug: `${scope}` }) })
    }
  })
}
