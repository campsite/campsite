import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugNotesNoteIdProjectPermissionsPutRequest } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, getTypedQueryData, setTypedInfiniteQueriesData, setTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate, getNormalizedData } from '@/utils/queryNormalization'

const getSyncProjects = apiClient.organizations.getSyncProjects()

interface Props extends OrganizationsOrgSlugNotesNoteIdProjectPermissionsPutRequest {
  noteId: string
}

export function useUpdateNoteProjectPermission() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    scope: { id: 'update-project-permission' },
    mutationFn: ({ noteId, ...data }: Props) =>
      apiClient.organizations.putNotesProjectPermissions().request(`${scope}`, noteId, data),
    onMutate: ({ noteId, ...data }) => {
      const previousNote = getNormalizedData({ queryNormalizer, type: 'note', id: noteId })
      const syncProjects = getTypedQueryData(queryClient, getSyncProjects.requestKey(`${scope}`))
      const project = syncProjects?.find((p) => p.id === data.project_id)

      if (previousNote?.project && previousNote.project.id !== data.project_id) {
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
          project_permission: data.permission,
          project,
          project_pin_id: null
        }
      })
    },
    onError: () => {
      // just invalidate project pins to put it back
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getProjectsPins().baseKey })
    }
  })
}
