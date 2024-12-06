import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import Image from 'next/image'

import { Comment, Note, TimelineEvent } from '@campsite/types'
import { CheckIcon, Link, RelativeTime, Tooltip, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { AttachmentLightbox } from '@/components/AttachmentLightbox'
import { CommentResolvedTombstone } from '@/components/Comments/CommentResolvedTombstone'
import { enumerateCommentElements } from '@/components/Comments/CommentsList'
import { NoteCommentComposer } from '@/components/Comments/NoteCommentComposer'
import { MemberHovercard } from '@/components/InlinePost/MemberHovercard'
import { MemberAvatar } from '@/components/MemberAvatar'
import { TimelineEventComment } from '@/components/TimelineEvent'
import { useScope } from '@/contexts/scope'
import { getImmediateScrollableNode } from '@/utils/scroll'
import { scrollInputIntoView } from '@/utils/scrollInputIntoView'
import { longTimestamp } from '@/utils/timestamp'

import { hoveredCanvasCommentAtom } from '../CanvasComments/CanvasComment'
import { CommentDescription } from '../Comments/CommentDescription'
import { CommentEngagements } from '../Comments/CommentEngagements'
import { CommentHoverActions } from '../Comments/CommentHoverActions'
import { KeepInView } from '../KeepInView'
import { commentElement } from '../Post/Notes/CommentRenderer'
import { activeNoteEditorAtom } from '../Post/Notes/types'

interface Props {
  comment: Comment
  note: Note
  hideAttachment?: boolean
  highlightPopover?: boolean
}

const ATTACHMENT_SIZE = 80

export function CommentComponent({ comment, note, hideAttachment = false, highlightPopover = false }: Props) {
  const [isReplyComposerVisible, setIsReplyComposerVisible] = useState(false)
  const [showResolvedComment, setShowResolvedComment] = useState(false)
  const replyComposerContainerId = `comment-${comment.id}-reply-composer-container`

  const showReplyComposer = () => {
    setIsReplyComposerVisible((prev) => !prev)

    setTimeout(() => {
      if (isReplyComposerVisible) {
        scrollInputIntoView(replyComposerContainerId)
      }
    }, 10)
  }

  const mixedItems = [
    ...comment.replies.map((reply) => ({ ...reply, type: 'reply' })),
    ...comment.timeline_events.map((event) => ({ ...event, type: 'timeline-event' }))
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  if (!showResolvedComment && comment.resolved_at) {
    return (
      <CommentResolvedTombstone
        comment={comment}
        showResolvedComment={showResolvedComment}
        setShowResolvedComment={setShowResolvedComment}
      />
    )
  }

  return (
    <div className='pb-3'>
      <div className='relative'>
        <div
          className={cn(
            'dark:before:border-gray-750 before:absolute before:-bottom-2.5 before:left-6 before:top-12 before:block before:w-3.5 before:rounded-bl-2xl before:border-b before:border-l',
            {
              'before:-bottom-2 before:rounded-bl-none before:border-b-0': highlightPopover
            }
          )}
        />
        <CommentDetails
          comment={comment}
          note={note}
          hideAttachment={hideAttachment}
          highlightPopover={highlightPopover}
        />
        {!!mixedItems.length && (
          <div className='pl-9'>
            {mixedItems.map((mixedItem) => {
              if (mixedItem.type === 'timeline-event') {
                const timelineEvent = mixedItem as TimelineEvent

                return (
                  <div key={timelineEvent.id} className='-ml-3 pb-4 pt-1'>
                    <TimelineEventComment timelineEvent={timelineEvent} />
                  </div>
                )
              }

              const reply = mixedItem as Comment

              return <Reply key={reply.id} reply={reply} note={note} />
            })}
          </div>
        )}
      </div>

      <div className={cn('scroll-m-32 pl-9', { 'pb-4': isReplyComposerVisible })} id={replyComposerContainerId}>
        <div className='px-3'>
          <div className='flex gap-2'>
            {!isReplyComposerVisible && !comment.parent_id && !highlightPopover && (
              <button
                className='text-tertiary hover:text-primary text-sm font-medium'
                onClick={showReplyComposer}
                disabled={comment.is_optimistic}
              >
                Write a reply
              </button>
            )}

            <KeepInView className='flex-1' disabled={!isReplyComposerVisible}>
              <NoteCommentComposer
                autoFocus
                placeholder='Write a reply...'
                closeComposer={() => setIsReplyComposerVisible(false)}
                onSubmitting={() => setIsReplyComposerVisible(false)}
                noteId={note.id}
                replyingToCommentId={comment?.id}
                open={isReplyComposerVisible}
                onCreated={(comment) => {
                  setTimeout(() => {
                    enumerateCommentElements(comment.id, (el) => {
                      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
                    })
                  }, 100)
                }}
              />
            </KeepInView>
          </div>
        </div>
      </div>
    </div>
  )
}

CommentComponent.displayName = 'Comment'

type CommentProps = Props & {
  isReply?: boolean
}

const CommentDetails = (props: CommentProps) => {
  const { comment, note, isReply = false, hideAttachment = false, highlightPopover = false } = props
  const { scope } = useScope()
  const setHoveredCanvasCommentId = useSetAtom(hoveredCanvasCommentAtom)
  const [isEditing, setIsEditing] = useState(false)
  const activeNodeEditor = useAtomValue(activeNoteEditorAtom)
  const [openAttachmentId, setOpenAttachmentId] = useState<string | undefined>()

  if (!comment) return null

  const createdAtTitle = longTimestamp(comment.created_at)

  return (
    <>
      <AttachmentLightbox
        subject={note}
        selectedAttachmentId={openAttachmentId}
        onClose={() => setOpenAttachmentId(undefined)}
        onSelectAttachment={({ id }) => setOpenAttachmentId(id)}
      />

      <div
        /*
          We use data-comment-id instead of id because there can be multiple comment sections in the document at once: the post view + an annotation comment, for example.
          
          Because of this, things like document.getElementById won't work correctly, so instead we need to use something more generic like
          document.querySelectorAll('[data-comment-id="#comment-123"]')
        */
        data-comment-id={highlightPopover ? undefined : `#comment-${comment.id}`}
        className={cn('initial:gap-3 group isolate flex flex-1 scroll-mt-1 p-3 transition-colors duration-150', {
          'gap-2 pt-1': isReply
        })}
        onMouseOver={highlightPopover ? () => setHoveredCanvasCommentId(comment.id) : undefined}
        onMouseLeave={highlightPopover ? () => setHoveredCanvasCommentId(undefined) : undefined}
      >
        <div className='self-start'>
          <MemberHovercard username={comment.member.user.username as string}>
            <span>
              <Link href={`/${scope}/people/${comment.member.user.username}`} className='relative'>
                <>
                  <MemberAvatar member={comment.member} size='sm' />
                  {comment.resolved_at && (
                    <Tooltip label={`Resolved by ${comment.resolved_by?.user.display_name}`}>
                      <span className='absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 text-white ring-2 ring-white dark:ring-gray-950'>
                        <CheckIcon className='text-white' size={12} strokeWidth={'2.5'} />
                      </span>
                    </Tooltip>
                  )}
                </>
              </Link>
            </span>
          </MemberHovercard>
        </div>

        <div
          // min-w-0 is needed so that the byline can truncate; without a width, text truncation doesn't work
          className={cn('initial:pt-px flex min-w-0 flex-1 flex-col gap-1.5', {
            'pt-0.5': isReply
          })}
        >
          <>
            <div className='relative z-50 -mb-1 -mt-1.5 flex items-center'>
              <div className='flex-1 flex-col space-x-1.5 truncate align-baseline leading-none'>
                <MemberHovercard username={comment.member.user.username as string}>
                  {/* span needed to attach popover listener events to a dom node */}
                  <span>
                    <Link href={`/${scope}/people/${comment.member.user.username}`}>
                      <UIText element='span' primary weight='font-medium' className='truncate'>
                        {comment.member.user.display_name}
                      </UIText>
                    </Link>
                  </span>
                </MemberHovercard>

                <Link
                  href={`/${scope}/notes/${note.id}#comment-${comment.id}`}
                  className={cn('text-tertiary hover:text-primary text-sm', {
                    'pointer-events-none': comment.is_optimistic
                  })}
                >
                  <Tooltip label={createdAtTitle}>
                    <RelativeTime time={comment.created_at} />
                  </Tooltip>
                </Link>
              </div>

              <div className='min-h-[34px]'>
                {!isEditing && (
                  <CommentHoverActions
                    comment={comment}
                    subjectId={note.id}
                    subjectType='note'
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    isInCanvas={highlightPopover}
                  />
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between gap-4'>
                <div className='-mt-1.5 flex max-w-full flex-1 flex-col gap-2'>
                  {!!comment.note_highlight && !highlightPopover && (
                    <button
                      className='relative mt-1 select-auto text-start'
                      onClick={() => {
                        if (!activeNodeEditor) return
                        const commentMarkElement = commentElement(comment.id, false, activeNodeEditor.view.dom)

                        const commentMarkElementRect = commentMarkElement?.getBoundingClientRect()
                        const top = commentMarkElementRect?.top ?? 0

                        const viewBottom = Math.max(100, window.innerHeight / 4)
                        const markIsOutOfView = top < 0 || top > viewBottom

                        if (markIsOutOfView && commentMarkElement instanceof HTMLElement) {
                          const scrollableParent = getImmediateScrollableNode(commentMarkElement)

                          scrollableParent.scrollTo({
                            top: scrollableParent.scrollTop + top - viewBottom,
                            behavior: 'smooth'
                          })
                        }
                      }}
                    >
                      <span
                        className='prose text-secondary line-clamp-3 pl-3 leading-normal before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:rounded-full before:bg-yellow-300 dark:before:bg-yellow-500'
                        dangerouslySetInnerHTML={{ __html: comment.note_highlight }}
                      ></span>
                    </button>
                  )}

                  <CommentDescription
                    subjectId={note.id}
                    subjectType='Note'
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    comment={comment}
                    isReply={isReply}
                  />
                </div>
                {!isEditing && comment.attachment_thumbnail_url && !hideAttachment && !highlightPopover && (
                  <div className='flex-none pt-1'>
                    {comment.attachment_id && (
                      <button
                        className='group/canvas-comment relative flex rounded-lg'
                        onClick={() => setOpenAttachmentId(comment.attachment_id ?? undefined)}
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

              <CommentEngagements comment={comment} />
            </div>
          </>
        </div>
      </div>
    </>
  )
}

interface ReplyProps {
  reply: Comment
  note: Note
  showReplyComposer?: () => void
}

const Reply = ({ reply, note }: ReplyProps) => {
  return (
    <div className='relative rounded-md transition-colors duration-150' id={`#comment-${reply.id}`}>
      <svg
        className='dark:text-gray-750 absolute -left-3 top-2.5 text-gray-200'
        width='13'
        height='13'
        viewBox='0 0 13 13'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path d='M0.5,0.5C0.5,7.12742 5.87258,12.5 12.5,12.5' stroke='currentColor' strokeLinecap='round' />
      </svg>

      <CommentDetails comment={reply} note={note} isReply />
    </div>
  )
}
