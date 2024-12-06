import { useMutation } from '@tanstack/react-query'

import { OrganizationPostAttachmentsPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useCreateNoteAttachment(id: string) {
  const { scope } = useScope()

  return useMutation({
    mutationFn: (data: OrganizationPostAttachmentsPostRequest) =>
      apiClient.organizations.postNotesAttachments().request(`${scope}`, id, data)
  })
}
