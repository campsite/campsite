import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

type Props = {
  noteId: string
  permissionId: string
}

export function useDeleteNotePermission() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ noteId, permissionId }: Props) =>
      apiClient.organizations.deleteNotesPermissionsById().request(`${scope}`, noteId, permissionId),
    onMutate({ noteId, permissionId }) {
      setTypedQueryData(
        queryClient,
        apiClient.organizations.getNotesPermissions().requestKey(`${scope}`, noteId),
        (old) => {
          if (!old) return
          return old.filter((permission) => permission.id !== permissionId)
        }
      )
    },
    onSuccess() {
      toast('Permission removed')
    }
  })
}
