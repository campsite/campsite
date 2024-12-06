import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugNotesNoteIdPermissionsPostRequest } from '@campsite/types'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

type Props = OrganizationsOrgSlugNotesNoteIdPermissionsPostRequest & {
  noteId: string
}

export function useCreateNotePermissions() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const pusherSocketIdHeader = usePusherSocketIdHeader()

  return useMutation({
    mutationFn: ({ noteId, ...data }: Props) =>
      apiClient.organizations
        .postNotesPermissions()
        .request(`${scope}`, noteId, data, { headers: pusherSocketIdHeader }),
    onSuccess(permissions, { noteId }) {
      setTypedQueryData(
        queryClient,
        apiClient.organizations.getNotesPermissions().requestKey(`${scope}`, noteId),
        (old) => {
          if (!old) return
          return [...old, ...permissions]
        }
      )
    }
  })
}
