import { useMutation } from '@tanstack/react-query'

import { OrganizationsOrgSlugProjectsProjectIdSubscriptionPostRequest } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

export function useCreateProjectSubscription(projectId: string) {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'update-project-subscription' },
    mutationFn: (data: OrganizationsOrgSlugProjectsProjectIdSubscriptionPostRequest) =>
      apiClient.organizations.postProjectsSubscription().request(`${scope}`, projectId, data),
    onMutate: (data) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'project',
        id: projectId,
        update: { viewer_has_subscribed: true, viewer_subscription: data.cascade ? 'posts_and_comments' : 'new_posts' }
      })
    }
  })
}
