import { Comment } from '@campsite/types'

import { EMPTY_HTML } from '@/atoms/markdown'
import { CommentComposerProps } from '@/components/Comments/CommentComposer'
import { CommentRenderer } from '@/components/Comments/CommentRenderer'
import { NoteCommentComposer } from '@/components/Comments/NoteCommentComposer'
import { KeepInView } from '@/components/KeepInView'
import { useUpdateCommentTaskList } from '@/hooks/useUpdateCommentTaskList'

import { PostCommentComposer } from './PostCommentComposer'

interface CommentDescriptionProps {
  comment: Comment
  isEditing: boolean
  isReply: boolean
  setIsEditing: (isEditing: boolean) => void
  subjectId: string
  subjectType: 'Post' | 'Note'
}

export function CommentDescription({
  comment,
  isEditing,
  setIsEditing,
  isReply,
  subjectId,
  subjectType
}: CommentDescriptionProps) {
  const updateTaskList = useUpdateCommentTaskList(comment.id)

  if (isEditing) {
    const shared: Omit<CommentComposerProps, 'subjectType' | 'subjectId'> = {
      open: true,
      autoFocus: true,
      placeholder: isReply ? 'Write a reply...' : 'Write a comment...',
      closeComposer: () => setIsEditing(false),
      onSubmitting: () => setIsEditing(false),
      comment: comment
    }

    if (subjectType === 'Note') {
      return (
        <div className='mt-2'>
          <NoteCommentComposer {...shared} noteId={subjectId} isEditing />
        </div>
      )
    }

    return (
      <KeepInView className='min-w-0 flex-1'>
        <PostCommentComposer {...shared} postId={subjectId} isEditing display='inline-edit' />
      </KeepInView>
    )
  }

  if (!comment.body_html || comment.body_html === EMPTY_HTML) return null

  return <CommentRenderer comment={comment} onCheckboxClick={updateTaskList.mutate} />
}
