import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'
import Router from 'next/router'

import { Note, NotePage, OrganizationsOrgSlugNotesPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedInfiniteQueriesData } from '@/utils/queryClient'

type Props = {
  afterCreate?: (note: Note) => void
}

const prependNote = (note: Note) => (old: InfiniteData<NotePage> | undefined) => {
  if (!old) return
  const [first, ...rest] = old.pages

  return {
    ...old,
    pages: [
      {
        ...first,
        data: [note, ...first.data]
      },
      ...rest
    ]
  }
}

export function useCreateNote({ afterCreate }: Props = {}) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugNotesPostRequest | void) =>
      apiClient.organizations.postNotes().request(`${scope}`, data ?? {}),
    onSuccess: async (note) => {
      const notesQueryKey = apiClient.organizations.getNotes().requestKey({ orgSlug: `${scope}` })
      const createdNotesQueryKey = apiClient.organizations.getMembersMeViewerNotes().requestKey({ orgSlug: `${scope}` })
      const forMeNotesQueryKey = apiClient.organizations.getMembersMeForMeNotes().requestKey({ orgSlug: `${scope}` })
      const cancelPromises = [
        queryClient.cancelQueries({ queryKey: notesQueryKey }),
        queryClient.cancelQueries({ queryKey: forMeNotesQueryKey }),
        queryClient.cancelQueries({ queryKey: createdNotesQueryKey })
      ]

      if (note.project) {
        const projectQueryKey = apiClient.organizations.getProjectsNotes().requestKey({
          orgSlug: `${scope}`,
          projectId: note.project.id
        })

        cancelPromises.push(queryClient.cancelQueries({ queryKey: projectQueryKey }))
      }

      await Promise.all(cancelPromises)

      setTypedInfiniteQueriesData(queryClient, notesQueryKey, prependNote(note))
      setTypedInfiniteQueriesData(queryClient, createdNotesQueryKey, prependNote(note))
      setTypedInfiniteQueriesData(queryClient, forMeNotesQueryKey, prependNote(note))

      afterCreate?.(note)
    }
  })
}

export function useCreateNewNote() {
  const { scope } = useScope()
  const { mutate: createNote, isPending } = useCreateNote()

  function handleCreate(data: OrganizationsOrgSlugNotesPostRequest = {}, onSuccess?: (note: Note) => void) {
    createNote(data, {
      onSuccess: (note) => {
        Router.push(`/${scope}/notes/${note.id}`)
        onSuccess?.(note)
      }
    })
  }

  return { handleCreate, isPending }
}
