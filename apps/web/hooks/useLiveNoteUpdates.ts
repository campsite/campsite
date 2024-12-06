import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Note } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { setNormalizedData } from '@/utils/queryNormalization'

import { useBindChannelEvent } from './useBindChannelEvent'
import { useChannel } from './useChannel'

const getNotesById = apiClient.organizations.getNotesById()
const getNoteComments = apiClient.organizations.getNotesComments()
const getNoteAttachmentComments = apiClient.organizations.getNotesAttachmentsComments()
const getAttachmentsById = apiClient.organizations.getAttachmentsById()
const getNotesViews = apiClient.organizations.getNotesViews()
const getNotesTimelineEvents = apiClient.organizations.getNotesTimelineEvents()

export function useLiveNoteUpdates(note: Note | undefined) {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()

  const invalidateReactionQueries = useCallback(
    function (e: { subject_id: string; subject_type: string; user_id: string }) {
      if (e.subject_type === 'Note') {
        queryClient.invalidateQueries({
          queryKey: getNotesById.requestKey(`${scope}`, e.subject_id)
        })
      }

      if (e.subject_type === 'Comment') {
        queryClient.invalidateQueries({
          queryKey: getNoteComments.requestKey({ orgSlug: `${scope}`, noteId: e.subject_id })
        })
      }
    },
    [queryClient, scope]
  )

  const invalidateCommentQueries = useCallback(
    function (e: { subject_id: string; user_id: string; attachment_id: string | null }) {
      queryClient.invalidateQueries({
        queryKey: getNotesById.requestKey(`${scope}`, e.subject_id)
      })
      queryClient.invalidateQueries({
        queryKey: getNoteComments.requestKey({ orgSlug: `${scope}`, noteId: e.subject_id })
      })

      if (e.attachment_id) {
        queryClient.invalidateQueries({
          queryKey: getNoteAttachmentComments.requestKey({
            orgSlug: `${scope}`,
            noteId: e.subject_id,
            attachmentId: e.attachment_id
          })
        })
        queryClient.invalidateQueries({
          queryKey: getAttachmentsById.requestKey(`${scope}`, e.attachment_id)
        })
      }
    },
    [queryClient, scope]
  )

  const updateContent = useCallback(
    function (e: { user_id: string | null; attributes: Partial<Note> }) {
      if (!note?.id || !e.user_id) return

      setNormalizedData({ queryNormalizer, type: 'note', id: note.id, update: e.attributes })
    },
    [note?.id, queryNormalizer]
  )

  const invalidateQuery = useCallback(
    function (e: { user_id: string | null }) {
      if (!note?.id || !e.user_id) return

      queryClient.invalidateQueries({
        queryKey: getNotesById.requestKey(`${scope}`, note.id)
      })
    },
    [note?.id, queryClient, scope]
  )

  const invalidateViewsQuery = useCallback(
    function (e: { user_id: string | null }) {
      if (!note?.id || !e.user_id) return

      queryClient.invalidateQueries({
        queryKey: getNotesViews.requestKey(`${scope}`, note.id)
      })
    },
    [note?.id, queryClient, scope]
  )

  const invalidateNoteTimelineQuery = useCallback(
    function () {
      if (!note?.id) return

      queryClient.invalidateQueries({
        queryKey: getNotesTimelineEvents.requestKey({ orgSlug: `${scope}`, noteId: note.id })
      })
    },
    [note?.id, queryClient, scope]
  )

  const channel = useChannel(note?.channel_name)

  useBindChannelEvent(channel, 'reactions-stale', invalidateReactionQueries)
  useBindChannelEvent(channel, 'comments-stale', invalidateCommentQueries)
  useBindChannelEvent(channel, 'content-stale', updateContent)
  useBindChannelEvent(channel, 'permissions-stale', invalidateQuery)
  useBindChannelEvent(channel, 'views-stale', invalidateViewsQuery)
  useBindChannelEvent(channel, 'timeline-events-stale', invalidateNoteTimelineQuery)
}
