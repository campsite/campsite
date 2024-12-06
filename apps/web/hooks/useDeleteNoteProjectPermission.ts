import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedInfiniteQueriesData, setTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate, getNormalizedData } from '@/utils/queryNormalization'

type Props = {
  noteId: string
}

export function useDeleteNoteProjectPermission() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'update-project-permission' },
    mutationFn: ({ noteId }: Props) =>
      apiClient.organizations.deleteNotesProjectPermissions().request(`${scope}`, noteId),
    onMutate: ({ noteId }) => {
      const previousNote = getNormalizedData({ queryNormalizer, type: 'note', id: noteId })

      if (previousNote?.project) {
        setTypedInfiniteQueriesData(
          queryClient,
          apiClient.organizations
            .getProjectsNotes()
            .requestKey({ orgSlug: `${scope}`, projectId: previousNote.project.id }),
          (old) => {
            return old
              ? {
                  ...old,
                  pages: old?.pages.map((page) => ({
                    ...page,
                    data: page.data.filter((note) => note.id !== previousNote.id) || []
                  }))
                }
              : old
          }
        )

        if (previousNote?.project_pin_id) {
          setTypedQueryData(
            queryClient,
            apiClient.organizations.getProjectsPins().requestKey(`${scope}`, previousNote.project.id),
            (oldData) => {
              return {
                ...oldData,
                data: oldData?.data.filter((pin) => pin.id !== previousNote.project_pin_id) || []
              }
            }
          )
        }
      }

      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'note',
        id: noteId,
        update: {
          project_permission: 'none',
          project: null,
          project_pin_id: null
        }
      })
    }
  })
}
