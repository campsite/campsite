import { useMutation } from '@tanstack/react-query'

import { OrganizationFigmaFileAttachmentDetailsPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useCreateFigmaFileAttachment() {
  const { scope } = useScope()

  return useMutation({
    mutationFn: (data: OrganizationFigmaFileAttachmentDetailsPostRequest) =>
      apiClient.organizations.postFigmaFileAttachmentDetails().request(`${scope}`, data)
  })
}
