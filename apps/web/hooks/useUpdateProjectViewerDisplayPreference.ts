import { useMutation } from '@tanstack/react-query'

import { OrganizationsOrgSlugProjectsProjectIdViewerDisplayPreferencesPutRequest } from '@campsite/types'

import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

interface Props extends OrganizationsOrgSlugProjectsProjectIdViewerDisplayPreferencesPutRequest {
  projectId: string
  orgSlug: string
}

export function useUpdateProjectViewerDisplayPreference() {
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ orgSlug, projectId, ...data }: Props) =>
      apiClient.organizations.putProjectsViewerDisplayPreferences().request(orgSlug, projectId, data),
    onMutate: ({ orgSlug: _, projectId, ...data }) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'project',
        id: projectId,
        update: { viewer_display_preferences: data }
      })
    }
  })
}
