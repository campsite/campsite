import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'

import { NotePage } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedInfiniteQueriesData, setTypedQueryData } from '@/utils/queryClient'
import { getNormalizedData } from '@/utils/queryNormalization'

const getNotes = apiClient.organizations.getNotes()
const getMembersMeViewerNotes = apiClient.organizations.getMembersMeViewerNotes()
const getProjectsNotes = apiClient.organizations.getProjectsNotes()
const getForMeNotes = apiClient.organizations.getMembersMeForMeNotes()

type Props = {
  noteId: string
  noteProjectId?: string
}

const removeNote = (noteId: string) => (old: InfiniteData<NotePage> | undefined) => {
  if (!old) return
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      data: page.data.filter((note) => note.id !== noteId)
    }))
  }
}

export function useDeleteNote() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ noteId }: Props) => apiClient.organizations.deleteNotesById().request(`${scope}`, noteId),
    onMutate: async ({ noteId, noteProjectId }) => {
      const getNotesQueryKey = getNotes.requestKey({ orgSlug: `${scope}` })
      const getMembersMeViewerNotesKey = getMembersMeViewerNotes.requestKey({ orgSlug: `${scope}` })
      const getForMeNotesQueryKey = getForMeNotes.requestKey({ orgSlug: `${scope}` })
      const getProjectsNotesQueryKey = noteProjectId
        ? getProjectsNotes.requestKey({ orgSlug: `${scope}`, projectId: noteProjectId })
        : undefined

      await Promise.all([
        queryClient.cancelQueries({ queryKey: getNotesQueryKey }),
        queryClient.cancelQueries({ queryKey: getMembersMeViewerNotesKey }),
        queryClient.cancelQueries({ queryKey: getProjectsNotesQueryKey }),
        queryClient.cancelQueries({ queryKey: getForMeNotesQueryKey })
      ])

      setTypedInfiniteQueriesData(queryClient, getNotesQueryKey, removeNote(noteId))
      setTypedInfiniteQueriesData(queryClient, getMembersMeViewerNotesKey, removeNote(noteId))
      setTypedInfiniteQueriesData(queryClient, getForMeNotesQueryKey, removeNote(noteId))

      if (getProjectsNotesQueryKey) {
        setTypedInfiniteQueriesData(queryClient, getProjectsNotesQueryKey, removeNote(noteId))
      }

      const previousNote = getNormalizedData({ queryNormalizer, type: 'note', id: noteId })

      if (previousNote?.project && previousNote.project_pin_id) {
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
    },
    onError: (_err, { noteProjectId }, _context) => {
      queryClient.invalidateQueries({ queryKey: getNotes.requestKey({ orgSlug: `${scope}` }) })
      queryClient.invalidateQueries({ queryKey: getMembersMeViewerNotes.requestKey({ orgSlug: `${scope}` }) })
      queryClient.invalidateQueries({ queryKey: getForMeNotes.requestKey({ orgSlug: `${scope}` }) })

      if (noteProjectId) {
        queryClient.invalidateQueries({
          queryKey: getProjectsNotes.requestKey({ orgSlug: `${scope}`, projectId: noteProjectId })
        })
      }

      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getProjectsPins().baseKey })
    }
  })
}
