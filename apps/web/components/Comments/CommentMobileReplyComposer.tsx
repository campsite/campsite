import { Comment, Post } from '@campsite/types/generated'
import { Avatar } from '@campsite/ui/Avatar'
import { cn } from '@campsite/ui/utils'

import { draftKey } from '@/atoms/markdown'
import { commentComposerId } from '@/components/Comments/CommentComposer'
import { useCommentLocalDraft } from '@/components/Comments/hooks/useCommentLocalDraft'
import { focusEditor } from '@/components/MarkdownEditor'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { stripHtml } from '@/utils/stripHtml'

interface CommentReplyPlaceholderProps {
  commentId: string
}

function CommentReplyPlaceholder({ commentId }: CommentReplyPlaceholderProps) {
  const draftReply = useCommentLocalDraft(draftKey({ replyingToCommentId: commentId }))

  return draftReply ? (
    <>
      <span>Continue reply</span>
      <span className='inline-block max-w-[180px] truncate break-all font-normal opacity-50'>
        {stripHtml(draftReply.body_html)}
      </span>
    </>
  ) : (
    'Write a reply'
  )
}

interface CommentMobileReplyComposerProps {
  post: Post
  comment: Comment
  replyingToCommentId?: string | null
  setReplyingToCommentId?: (id: string | null) => void
}

export function CommentMobileReplyComposer({
  post,
  comment,
  replyingToCommentId,
  setReplyingToCommentId
}: CommentMobileReplyComposerProps) {
  const { data: currentUser } = useGetCurrentUser()
  const isReplyComposerVisible = replyingToCommentId === comment.id
  const showAddReplyButton = !isReplyComposerVisible && !comment.parent_id
  const showCancelReplyButton = isReplyComposerVisible

  const toggleReplyComposer = () => {
    if (!post.viewer_is_organization_member) return

    if (isReplyComposerVisible) {
      setReplyingToCommentId?.(null)
      return
    }

    setReplyingToCommentId?.(comment.id)

    /**
     * Since we're both updating state and focusing as part of the same event handler,
     * we need to make sure the DOM is updated before we look up the editor by the id
     * which was just assigned.
     *
     * By deferring execution to the next microtask, we are ensuring that React will first
     * commit the DOM update, and then we'll focus the input.
     **/
    queueMicrotask(() => {
      const editorId = commentComposerId(post.id, comment.id)

      focusEditor(editorId)
    })
  }

  return (
    <div className='relative isolate flex flex-1 scroll-m-32 gap-3 p-3'>
      <button
        onClick={toggleReplyComposer}
        className='absolute inset-0 z-50 cursor-text'
        disabled={comment.is_optimistic}
      />

      <Avatar urls={currentUser?.avatar_urls} size='sm' rounded='rounded-full' name={currentUser?.display_name} />

      <p
        className={cn('flex items-center gap-2', {
          'text-secondary text-[15px] font-semibold': showCancelReplyButton,
          'text-quaternary text-[15px]': showAddReplyButton
        })}
      >
        {showAddReplyButton ? (
          <CommentReplyPlaceholder commentId={comment.id} />
        ) : (
          showCancelReplyButton && 'Cancel reply'
        )}
      </p>
    </div>
  )
}
