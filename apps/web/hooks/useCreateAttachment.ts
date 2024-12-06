import { useMutation } from '@tanstack/react-query'

import { OrganizationAttachmentsPostRequest } from '@campsite/types'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useCreateAttachment() {
  const { scope } = useScope()
  const headers = usePusherSocketIdHeader()

  return useMutation({
    mutationFn: (data: OrganizationAttachmentsPostRequest) =>
      apiClient.organizations.postAttachments().request(`${scope}`, data, { headers })
  })
}
