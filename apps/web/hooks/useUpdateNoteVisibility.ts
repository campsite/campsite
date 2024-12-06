import { useMutation } from '@tanstack/react-query'

import { OrganizationsOrgSlugNotesNoteIdVisibilityPutRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

type Props = OrganizationsOrgSlugNotesNoteIdVisibilityPutRequest & {
  noteId: string
}

export function useUpdateNoteVisibility() {
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ noteId, ...data }: Props) =>
      apiClient.organizations.putNotesVisibility().request(`${scope}`, `${noteId}`, data),
    onMutate: ({ noteId, visibility }) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'note',
        id: noteId,
        update: { public_visibility: visibility === 'public' }
      })
    }
  })
}
