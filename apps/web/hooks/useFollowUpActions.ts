import { useCallback } from 'react'

import { useCallbackRef } from '@campsite/ui/hooks'

import { useCreateCallFollowUp } from '@/hooks/useCreateCallFollowUp'
import { useCreateNoteFollowUp } from '@/hooks/useCreateNoteFollowUp'
import { useDeleteCallFollowUp } from '@/hooks/useDeleteCallFollowUp'
import { useDeleteNoteFollowUp } from '@/hooks/useDeleteNoteFollowUp'
import { useUpdateFollowUp } from '@/hooks/useUpdateFollowUp'
import { normyTypeFromApiTypeName } from '@/utils/optimisticFollowUps'

import { useCreateCommentFollowUp } from './useCreateCommentFollowUp'
import { useCreatePostFollowUp } from './useCreatePostFollowUp'
import { useDeleteCommentFollowUp } from './useDeleteCommentFollowUp'
import { useDeletePostFollowUp } from './useDeletePostFollowUp'

type Props = {
  subject_id: string
  subject_type: string
  onCreate?: () => void
}

export function useFollowUpActions({ subject_id, subject_type, onCreate }: Props) {
  const type = normyTypeFromApiTypeName(subject_type)

  const onCreateRef = useCallbackRef(onCreate)

  const { mutate: createPostFollowUp } = useCreatePostFollowUp()
  const { mutate: deletePostFollowUp } = useDeletePostFollowUp()

  const { mutate: createNoteFollowUp } = useCreateNoteFollowUp()
  const { mutate: deleteNoteFollowUp } = useDeleteNoteFollowUp()

  const { mutate: createCommentFollowUp } = useCreateCommentFollowUp()
  const { mutate: deleteCommentFollowUp } = useDeleteCommentFollowUp()

  const { mutate: createCallFollowUp } = useCreateCallFollowUp()
  const { mutate: deleteCallFollowUp } = useDeleteCallFollowUp()

  const { mutate: updateFollowUpMutation } = useUpdateFollowUp()

  const createFollowUp = useCallback(
    ({ show_at }: { show_at: string }) => {
      switch (type) {
        case 'post':
          return createPostFollowUp({ postId: subject_id, show_at }, { onSuccess: onCreateRef })
        case 'comment':
          return createCommentFollowUp({ commentId: subject_id, show_at }, { onSuccess: onCreateRef })
        case 'note':
          return createNoteFollowUp({ noteId: subject_id, show_at }, { onSuccess: onCreateRef })
        case 'call':
          return createCallFollowUp({ callId: subject_id, show_at }, { onSuccess: onCreateRef })
      }
    },
    [type, createPostFollowUp, subject_id, onCreateRef, createCommentFollowUp, createNoteFollowUp, createCallFollowUp]
  )

  const deleteFollowUp = useCallback(
    ({ id }: { id: string }) => {
      switch (type) {
        case 'post':
          return deletePostFollowUp({ postId: subject_id, id })
        case 'comment':
          return deleteCommentFollowUp({ commentId: subject_id, id })
        case 'note':
          return deleteNoteFollowUp({ noteId: subject_id, id })
        case 'call':
          return deleteCallFollowUp({ callId: subject_id, id })
      }
    },
    [type, deletePostFollowUp, subject_id, deleteCommentFollowUp, deleteNoteFollowUp, deleteCallFollowUp]
  )

  const updateFollowUp = useCallback(
    ({ id, show_at }: { id: string; show_at: string }) => {
      return updateFollowUpMutation({ id, subjectId: subject_id, subjectType: subject_type, show_at })
    },
    [updateFollowUpMutation, subject_id, subject_type]
  )

  return { createFollowUp, deleteFollowUp, updateFollowUp }
}
