import { useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { useRouter } from 'next/router'

import { Post } from '@campsite/types'
import {
  AlarmCheckIcon,
  AlarmIcon,
  Button,
  ChatBubbleIcon,
  FeedbackRequestAltIcon,
  FeedbackRequestCompleteIcon,
  PaperAirplaneIcon
} from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { commentComposerId } from '@/components/Comments/CommentComposer'
import { DisplayType } from '@/components/InlinePost'
import { InlinePostReactions } from '@/components/InlinePost/InlinePostReactions'
import { PostSharePopover } from '@/components/Post/PostSharePopover'

import { PostCommentComposer } from '../Comments/PostCommentComposer'
import { focusEditor } from '../MarkdownEditor'
import { InlinePostFollowUpDropdown } from './InlinePostFollowUpDropdown'

interface InlinePostSocialActionsProps {
  post: Post
  display: DisplayType
}

export function InlinePostSocialActions({ post, display }: InlinePostSocialActionsProps) {
  const router = useRouter()
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)

  if (display === 'page') {
    return (
      <div className='-ml-1 flex flex-wrap items-center gap-x-0.5 gap-y-1 py-2'>
        <InlinePostReactions post={post} />
      </div>
    )
  }

  const isPostPage = router.pathname === '/[org]/posts/[postId]'
  const isInboxPage = router.pathname === '/[org]/inbox/[inboxView]'
  const inlineBehavior = isPostPage || isInboxPage
  const viewerFollowUp = post.follow_ups.find((followUp) => followUp.belongs_to_viewer)
  const viewerFeedbackRequested = post.viewer_feedback_status === 'viewer_requested'
  const inlineReplyId = `inline-reply-${post.id}`

  function toggleCommentUI() {
    setIsCommenting(inlineBehavior ? true : (prev) => !prev)
  }

  function focusCommentInput() {
    if (!inlineBehavior && !isCommenting) return

    // if inline, scroll to the outer container that has some extra top padding
    const editorId = inlineBehavior ? commentComposerId(post.id) : inlineReplyId

    focusEditor(editorId)
  }

  function handleCommentCreated() {
    setIsCommenting(false)
  }

  // to show + focus the TipTap editor on iOS these must happen in separate events.
  // iOS doesn't let you bring up the keyboard in a setTimeout, but it does in a pointerup event.
  // on post pages the input is already visible so we can skip the first event.
  const commentButtonProps = {
    onPointerDown: inlineBehavior ? undefined : toggleCommentUI,
    onPointerUp: inlineBehavior ? undefined : focusCommentInput,
    onClick: inlineBehavior ? focusCommentInput : undefined
  }

  return (
    <div>
      <div className='flex flex-col'>
        <div className='-ml-1 flex flex-wrap items-center gap-x-0.5 gap-y-1'>
          {post.status === 'feedback_requested' && (
            <>
              {(post.viewer_feedback_status === 'none' && !post.viewer_is_author) ||
              (post.viewer_has_commented && !post.viewer_is_author) ? (
                <Button
                  iconOnly={<FeedbackRequestCompleteIcon size={24} />}
                  variant={'plain'}
                  round
                  accessibilityLabel='Commented'
                  {...commentButtonProps}
                />
              ) : post.viewer_is_author ? (
                <Button
                  iconOnly={
                    post.status === 'feedback_requested' ? (
                      <FeedbackRequestAltIcon size={24} />
                    ) : (
                      <ChatBubbleIcon size={24} />
                    )
                  }
                  accessibilityLabel='Comment'
                  variant='plain'
                  round
                  {...commentButtonProps}
                />
              ) : (
                <Button
                  leftSlot={<FeedbackRequestAltIcon />}
                  variant={viewerFeedbackRequested ? 'plain' : 'flat'}
                  round
                  className={cn({
                    'bg-brand-primary hover:bg-brand-secondary dark:hover:bg-brand-secondary text-white':
                      viewerFeedbackRequested,
                    'hover:text-primary text-secondary': !viewerFeedbackRequested
                  })}
                  {...commentButtonProps}
                >
                  Feedback requested
                </Button>
              )}
            </>
          )}

          {post.status === 'none' && (
            <Button
              iconOnly={<ChatBubbleIcon size={24} />}
              accessibilityLabel='Comment'
              variant='plain'
              round
              {...commentButtonProps}
            />
          )}

          {post.viewer_is_organization_member && (
            <PostSharePopover
              side='top'
              align='start'
              post={post}
              open={sharePopoverOpen}
              onOpenChange={setSharePopoverOpen}
              source='feed'
            >
              <Button iconOnly={<PaperAirplaneIcon size={24} />} accessibilityLabel='Share' variant='plain' round />
            </PostSharePopover>
          )}
          <InlinePostFollowUpDropdown post={post}>
            <Button
              iconOnly={viewerFollowUp ? <AlarmCheckIcon size={24} /> : <AlarmIcon size={24} />}
              accessibilityLabel='Follow-up'
              variant='plain'
              round
            />
          </InlinePostFollowUpDropdown>

          <InlinePostReactions post={post} />
        </div>

        <AnimatePresence>
          {!inlineBehavior && isCommenting && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.1 }}
              className='cursor-auto'
              id={inlineReplyId}
            >
              <div className='pt-2'>
                <PostCommentComposer autoFocus={false} onOptimisticCreate={handleCommentCreated} postId={post.id} />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
