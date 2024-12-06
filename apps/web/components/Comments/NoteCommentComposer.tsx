import { useMemo } from 'react'
import { FormProvider } from 'react-hook-form'

import { useCommentForm } from '@/components/Comments/hooks/useCommentForm'
import { useGetNoteComments } from '@/hooks/useGetNoteComments'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

import { CommentComposer, CommentComposerProps } from './CommentComposer'

type NoteCommentComposerProps = Omit<CommentComposerProps, 'subjectId' | 'subjectType'> & {
  noteId: string
}

export function NoteCommentComposer({ noteId, ...props }: NoteCommentComposerProps) {
  /**
   * Whenever we send a comment, the component re-mounts which triggers a re-fetch of comments.
   * This extra fetch ends up creating a race condition. Since the DB might not have created the comment yet,
   * this results in blowing away the optimistic update and making the user think their comment was lost.
   *
   * That's why we need to explicitly disable refetchOnMount.
   */
  const getComments = useGetNoteComments({ noteId, refetchOnMount: false })
  const defaultMentions = useMemo(
    () => flattenInfiniteData(getComments.data)?.map((comment) => comment.member) ?? [],
    [getComments.data]
  )

  const composerProps: CommentComposerProps = {
    ...props,
    subjectId: noteId,
    subjectType: 'note',
    defaultMentions: defaultMentions
  }

  const methods = useCommentForm(composerProps)

  return (
    <FormProvider {...methods}>
      <CommentComposer {...composerProps} />
    </FormProvider>
  )
}
