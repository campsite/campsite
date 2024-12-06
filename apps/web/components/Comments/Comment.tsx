import { memo, useState } from 'react'
import { LayoutGroup } from 'framer-motion'
import { useAtomValue, useSetAtom } from 'jotai'
import Image from 'next/image'

import { Comment, Post, TimelineEvent } from '@campsite/types'
import { Badge, CanvasCommentIcon, PhotoHideIcon, RelativeTime, Tooltip, UIText, useBreakpoint } from '@campsite/ui'
import { cn, ConditionalWrap } from '@campsite/ui/src/utils'

import { PostAttachmentLightbox } from '@/components/AttachmentLightbox/PostAttachmentLightbox'
import { AuthorLink } from '@/components/AuthorLink'
import {
  CommentInnerLayoutTransitionContainer,
  CommentLayoutTransitionContainer
} from '@/components/Comments/CommentLayoutTransitionContainer'
import { CommentMobileReplyComposer } from '@/components/Comments/CommentMobileReplyComposer'
import { GroupedAttachments } from '@/components/GroupedAttachments'
import { MemberHovercard } from '@/components/InlinePost/MemberHovercard'
import { MemberAvatar } from '@/components/MemberAvatar'
import { TimelineEventComment } from '@/components/TimelineEvent'
import { serverIdToOptimisticIdMessagesAtom } from '@/hooks/useCreateCommentCallbacks'
import { useGetAttachment } from '@/hooks/useGetAttachment'
import { longTimestamp } from '@/utils/timestamp'

import { hoveredCanvasCommentAtom } from '../CanvasComments/CanvasComment'
import {
  clearNewCommentCoordinatesAtom,
  displayCanvasCommentsAtom,
  selectedCanvasCommentIdAtom
} from '../CanvasComments/CanvasComments'
import { AutoBlockquoteReply } from '../InlinePost/AutoBlockquoteReply'
import { KeepInView } from '../KeepInView'
import { PostLink } from '../Post/PostLink'
import { panZoomAtom } from '../ZoomPane/atom'
import { CommentDescription } from './CommentDescription'
import { CommentEngagements } from './CommentEngagements'
import { CommentHoverActions } from './CommentHoverActions'
import { CommentResolvedTombstone } from './CommentResolvedTombstone'
import { PostCommentComposer } from './PostCommentComposer'

interface Props {
  comment: Comment
  post: Post
  isCanvas?: boolean
  replyingToCommentId?: string | null
  setReplyingToCommentId?: (id: string | null) => void
}

const ATTACHMENT_SIZE = 80

export const CommentComponent = memo(
  ({ comment, post, isCanvas, replyingToCommentId, setReplyingToCommentId }: Props) => {
    const canReplyInline = useBreakpoint('md')
    const [showResolvedComment, setShowResolvedComment] = useState(false)
    const serverIdToOptimisticIdMessages = useAtomValue(serverIdToOptimisticIdMessagesAtom)
    const hideCommentReplyComposer = isCanvas || (!showResolvedComment && comment.resolved_at)

    const mixedItems = [
      ...comment.replies.map((reply) => ({ ...reply, type: 'reply' })),
      ...comment.timeline_events.map((event) => ({ ...event, type: 'timeline-event' }))
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    return (
      <LayoutGroup>
        <div
          className={cn(
            'divide-secondary relative isolate divide-y',
            !isCanvas &&
              'bg-elevated dark:bg-secondary my-3 overflow-hidden rounded-lg border-[0.5px] shadow-sm dark:border-0 dark:shadow-[inset_0_0.5px_0_rgb(255_255_255/0.06),_inset_0_0_0.5px_rgb(255_255_255/0.1)]'
          )}
        >
          {/* Comment Root */}
          <CommentLayoutTransitionContainer
            initial={comment.is_optimistic}
            show={!(!showResolvedComment && comment.resolved_at)}
          >
            <CommentDetails
              post={post}
              comment={comment}
              isCanvas={isCanvas}
              replyingToCommentId={replyingToCommentId}
            />
          </CommentLayoutTransitionContainer>

          {/* Comment Resolved Tombstone */}
          <CommentLayoutTransitionContainer initial={false} show={!!comment.resolved_at}>
            <CommentResolvedTombstone
              comment={comment}
              showResolvedComment={showResolvedComment}
              setShowResolvedComment={setShowResolvedComment}
            />
          </CommentLayoutTransitionContainer>

          {/* Mixed Comment Items (Replies + Timeline Events) */}
          {mixedItems.map((mixedItem) => {
            const shouldHide = !showResolvedComment && comment.resolved_at

            if (mixedItem.type === 'timeline-event') {
              const timelineEvent = mixedItem as TimelineEvent

              return (
                <CommentLayoutTransitionContainer key={timelineEvent.id} initial={false} show={!shouldHide}>
                  <TimelineEventComment key={timelineEvent.id} timelineEvent={timelineEvent} />
                </CommentLayoutTransitionContainer>
              )
            }

            const reply = mixedItem as Comment
            const optimisticId = reply.optimistic_id ?? serverIdToOptimisticIdMessages.get(reply.id)

            return (
              <CommentLayoutTransitionContainer
                key={optimisticId ?? reply.id}
                initial={reply.is_optimistic}
                show={!shouldHide}
              >
                <CommentDetails post={post} comment={reply} replyingToCommentId={replyingToCommentId} isReply />
              </CommentLayoutTransitionContainer>
            )
          })}

          {/* Desktop Comment Composer */}
          <CommentLayoutTransitionContainer
            initial={comment.is_optimistic}
            show={canReplyInline && !hideCommentReplyComposer}
            // TODO: remove this once we migrated to the new bubble menu
            className='!overflow-visible'
          >
            <KeepInView className='min-w-0 flex-1'>
              <PostCommentComposer
                lazyLoadMarkdownEditor
                display='inline-refresh'
                placeholder='Write a reply'
                postId={post.id}
                replyingToCommentId={comment.id}
                disabled={comment.is_optimistic}
              />
            </KeepInView>
          </CommentLayoutTransitionContainer>

          {/* Mobile Comment Composer */}
          {!canReplyInline && !hideCommentReplyComposer && (
            <CommentMobileReplyComposer
              post={post}
              comment={comment}
              replyingToCommentId={replyingToCommentId}
              setReplyingToCommentId={setReplyingToCommentId}
            />
          )}
        </div>
      </LayoutGroup>
    )
  }
)

CommentComponent.displayName = 'Comment'

interface CommentProps {
  post: Post
  comment: Comment
  replyingToCommentId?: string | null
  isReply?: boolean
  isCanvas?: boolean
}

const CommentDetails = ({ comment, post, replyingToCommentId, isReply = false, isCanvas = false }: CommentProps) => {
  const setClearNewCommentCoordinates = useSetAtom(clearNewCommentCoordinatesAtom)
  const setDisplayCanvasComments = useSetAtom(displayCanvasCommentsAtom)
  const setHoveredCanvasCommentId = useSetAtom(hoveredCanvasCommentAtom)
  const setSelectedCanvasCommentId = useSetAtom(selectedCanvasCommentIdAtom)
  const setPan = useSetAtom(panZoomAtom)
  const [isEditing, setIsEditing] = useState(false)

  const currentCanvasCommentId = useAtomValue(selectedCanvasCommentIdAtom)
  const isAttachmentComment = !!comment?.attachment_id
  const getAttachment = useGetAttachment(comment?.attachment_id, isAttachmentComment)

  const onCanvasCommentClick = () => {
    if (!comment.attachment_id) return

    setSelectedPostAttachmentId(comment.attachment_id)
    setClearNewCommentCoordinates()
    setDisplayCanvasComments(true)
    setSelectedCanvasCommentId(comment.id)

    if (
      currentCanvasCommentId === comment.id &&
      comment &&
      typeof comment.x === 'number' &&
      typeof comment.y === 'number'
    ) {
      setPan({
        x: comment.x,
        y: comment.y
      })
    }
  }

  const [selectedPostAttachmentId, setSelectedPostAttachmentId] = useState<string | undefined>()

  const createdAtTitle = longTimestamp(comment.created_at)
  const attachment = getAttachment.data || post.attachments.find((f) => f.id === comment.attachment_id)

  const hideResolvesPostBadge = post.resolution?.resolved_comment?.id !== comment.id
  const hideCommentEngagements = isEditing || (!comment.grouped_reactions.length && !comment.follow_ups.length)

  return (
    <>
      {comment.attachment_id && (
        <PostAttachmentLightbox
          postId={post.id}
          selectedAttachmentId={selectedPostAttachmentId}
          setSelectedAttachmentId={setSelectedPostAttachmentId}
        />
      )}

      <div
        /*
          We use data-comment-id instead of id because there can be multiple comment sections in the document at once: the post view + an annotation comment, for example.

          Because of this, things like document.getElementById won't work correctly, so instead we need to use something more generic like
          document.querySelectorAll('[data-comment-id="#comment-123"]')
        */
        data-comment-id={isCanvas ? undefined : `#comment-${comment.id}`}
        className={cn(
          'group relative isolate',
          'initial:gap-3 flex flex-1 scroll-mt-1 p-3',
          'transition-colors duration-150',
          {
            'max-md:bg-tertiary': replyingToCommentId === comment.id,
            'max-md:opacity-60':
              replyingToCommentId && replyingToCommentId !== comment.id && replyingToCommentId !== comment.parent_id
          }
        )}
        onMouseOver={!isCanvas ? () => setHoveredCanvasCommentId(comment.id) : undefined}
        onMouseLeave={!isCanvas ? () => setHoveredCanvasCommentId(undefined) : undefined}
      >
        <div className='self-start'>
          <ConditionalWrap
            condition={post.viewer_is_organization_member && !!comment.member.user.username}
            wrap={(c) => (
              <MemberHovercard username={comment.member.user.username}>
                <AuthorLink user={comment.member.user} className='relative'>
                  {c}
                </AuthorLink>
              </MemberHovercard>
            )}
          >
            <MemberAvatar member={comment.member} size='sm' />
          </ConditionalWrap>
        </div>

        <div
          className={cn(
            'initial:pt-px flex flex-1 flex-col',
            'min-w-0', // This is needed so that the byline can truncate; without a width, text truncation doesn't work
            {
              'pt-0.5': isReply
            }
          )}
        >
          <div className='relative z-50 -mb-1 -mt-1.5 flex items-center'>
            <div className='flex min-w-0 flex-1 space-x-1.5 align-baseline leading-none'>
              <ConditionalWrap
                condition={post.viewer_is_organization_member}
                wrap={(children) => (
                  <MemberHovercard username={comment.member.user.username}>
                    <AuthorLink user={comment.member.user}>{children}</AuthorLink>
                  </MemberHovercard>
                )}
              >
                <UIText element='span' primary weight='font-medium' className='break-anywhere line-clamp-1'>
                  {comment.member.user.display_name}
                </UIText>
              </ConditionalWrap>

              <PostLink
                postId={post.id}
                hash={`#comment-${comment.id}`}
                className={cn('text-tertiary hover:text-primary whitespace-nowrap text-sm', {
                  'pointer-events-none': comment.is_optimistic
                })}
              >
                <Tooltip label={createdAtTitle}>
                  <RelativeTime time={comment.created_at} />
                </Tooltip>
              </PostLink>
            </div>

            <div className='min-h-[34px]'>
              {!isEditing && (
                <CommentHoverActions
                  comment={comment}
                  subjectId={post.id}
                  subjectType='post'
                  isInCanvas={isCanvas}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  canResolvePost={post.viewer_can_resolve && !post.resolution}
                  canUnresolvePost={post.resolution?.resolved_comment?.id === comment.id}
                />
              )}
            </div>
          </div>

          <CommentInnerLayoutTransitionContainer initial={false} show={!hideResolvesPostBadge}>
            <Badge color='green' className='mb-1.5 mt-1 w-fit self-start font-mono'>
              Resolves post
            </Badge>
          </CommentInnerLayoutTransitionContainer>

          <div className='flex justify-between gap-4 pb-2'>
            <AutoBlockquoteReply
              post={post}
              replyingToCommentId={comment.parent_id ?? comment.id}
              className='flex max-w-full flex-1 flex-col gap-2'
              enabled={!isEditing}
            >
              <CommentDescription
                subjectId={post.id}
                subjectType='Post'
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                comment={comment}
                isReply={isReply}
              />
            </AutoBlockquoteReply>

            {!isEditing && !attachment && comment.x && comment.y && !isCanvas && (
              <Tooltip label='Attachment was deleted' side='bottom'>
                <div className='bg-quaternary flex h-20 w-20 items-center justify-center rounded-lg'>
                  <div className='text-tertiary flex'>
                    <PhotoHideIcon size={32} />
                  </div>
                </div>
              </Tooltip>
            )}

            {!isEditing && comment.canvas_preview_url && !isCanvas && (
              <div className='flex-none pt-1'>
                {comment.attachment_id && (
                  <button
                    draggable={false}
                    className='group/canvas-comment relative flex rounded-lg'
                    onClick={onCanvasCommentClick}
                  >
                    <Image
                      src={comment.canvas_preview_url}
                      width={ATTACHMENT_SIZE}
                      height={ATTACHMENT_SIZE}
                      className='bg-secondary aspect-square rounded-lg object-contain ring-1 ring-black/10 hover:ring-black/20 dark:ring-white/10 dark:hover:ring-white/20'
                      alt='Canvas comment'
                    />

                    <div className='absolute bottom-1 right-1 flex items-center justify-center rounded-md bg-white px-1 py-1 text-black ring-1 ring-black/5 group-hover/canvas-comment:text-black'>
                      <CanvasCommentIcon size={14} />
                    </div>
                  </button>
                )}
              </div>
            )}

            {!isEditing &&
              post.attachments.length > 1 &&
              !isCanvas &&
              !comment.x &&
              !comment.y &&
              comment.attachment_thumbnail_url &&
              !comment.parent_id && (
                <div className='flex-none pt-1'>
                  {comment.attachment_id && (
                    <button
                      draggable={false}
                      className='group/canvas-comment relative flex'
                      onClick={onCanvasCommentClick}
                    >
                      <Image
                        src={comment.attachment_thumbnail_url}
                        width={ATTACHMENT_SIZE}
                        height={ATTACHMENT_SIZE}
                        className='bg-secondary aspect-square rounded-md object-cover ring-1 ring-black/10 hover:ring-black/20 dark:ring-white/10 dark:hover:ring-white/20'
                        alt='Attachment comment'
                      />
                    </button>
                  )}
                </div>
              )}
          </div>

          <GroupedAttachments
            display='page'
            postId={post.id}
            attachments={comment.attachments}
            content={comment.body_html}
          />

          <CommentInnerLayoutTransitionContainer initial={false} show={!hideCommentEngagements}>
            <CommentEngagements
              comment={comment}
              postId={post.id}
              isOrganizationMember={post.viewer_is_organization_member}
            />
          </CommentInnerLayoutTransitionContainer>
        </div>
      </div>
    </>
  )
}
