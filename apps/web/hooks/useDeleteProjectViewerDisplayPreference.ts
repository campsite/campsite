import { useMutation } from '@tanstack/react-query'

import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

interface Props {
  projectId: string
  orgSlug: string
}

export function useDeleteProjectViewerDisplayPreference() {
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ orgSlug, projectId }: Props) =>
      apiClient.organizations.deleteProjectsViewerDisplayPreferences().request(orgSlug, projectId),
    onMutate: ({ orgSlug: _, projectId }) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'project',
        id: projectId,
        update: { viewer_display_preferences: null }
      })
    }
  })
}
