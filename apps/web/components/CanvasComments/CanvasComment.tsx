import { useMemo, useRef, useState } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ZoomTransform } from 'd3-zoom'
import { AnimatePresence, m } from 'framer-motion'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import useMeasure from 'react-use-measure'
import { useDebouncedCallback } from 'use-debounce'

import { Comment, Post, User } from '@campsite/types'
import { ANIMATION_CONSTANTS, RelativeTime, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { selectedCanvasCommentIdAtom } from '@/components/CanvasComments/CanvasComments'
import { CommentComponent } from '@/components/Comments/Comment'
import { FacePile } from '@/components/FacePile'
import { useGetComment } from '@/hooks/useGetComment'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

import { CommentDescription } from '../Comments/CommentDescription'
import { PostCommentComposer } from '../Comments/PostCommentComposer'
import { panZoomAtom, zoomAtom } from '../ZoomPane/atom'

export const hoveredCanvasCommentAtom = atom<string | undefined>(undefined)

const COLLISION_PADDING = 8

function getTranslation({
  coordinates,
  transform,
  triggerRect,
  commentRect,
  viewport
}: {
  coordinates: Props['coordinates']
  transform: ZoomTransform
  triggerRect: { width: number; height: number }
  commentRect: { width: number; height: number }
  viewport: { width: number; height: number }
}) {
  const x = coordinates.x * transform.k + transform.x
  const right = x + triggerRect.width + commentRect.width

  let side: 'right' | 'left' = 'right'

  if (right > viewport.width - COLLISION_PADDING * 2) {
    // Comment would be offscreen to the right; render left
    side = 'left'
  }

  const y = coordinates.y * transform.k + transform.y
  const bottom = y - triggerRect.height + commentRect.height

  const translateY = Math.max(
    // Ensure comment does not go above bottom of face pile
    triggerRect.height - commentRect.height,
    // Ensure comment does not go below bottom of viewport
    Math.min(0, -1 * (bottom - viewport.height + COLLISION_PADDING))
  )

  return {
    side,
    translateY
  }
}

interface Props {
  post: Post
  coordinates: { x: number; y: number }
  attachmentId: string
  isOpen?: boolean
  onSelected?: (commentId: string) => void
  onDismiss?: () => void
}

export function NewCanvasComment(props: Props) {
  const [createdCommentId, setCreatedCommentId] = useState<string | undefined>(undefined)
  const { data: createdComment } = useGetComment(createdCommentId ?? '')

  return <InnerCanvasComment {...props} comment={createdComment} onCreate={setCreatedCommentId} />
}

type CanvasCommentProps = Props & {
  comment: Comment
}

export function CanvasComment(props: CanvasCommentProps) {
  return <InnerCanvasComment {...props} />
}

type InnerCanvasCommentProps = Props & {
  comment: Comment | undefined
  onCreate?: (commentId: string) => void
}

function InnerCanvasComment({
  post,
  coordinates,
  attachmentId,
  comment,
  onCreate,
  onSelected,
  onDismiss,
  isOpen = false
}: InnerCanvasCommentProps) {
  // uses the commentId prop or is set to the optimistic+server id on create
  const hoveredCanvasCommentId = useAtomValue(hoveredCanvasCommentAtom)
  const currentCanvasCommentId = useAtomValue(selectedCanvasCommentIdAtom)

  const [isHovering, setIsHovering] = useState(false)

  const commentContainerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const setPan = useSetAtom(panZoomAtom)

  const jumpIntoView = useDebouncedCallback(
    () => {
      setPan({
        x: coordinates.x,
        y: coordinates.y,
        behavior: 'auto'
      })
    },
    200,
    { leading: true }
  )

  const { viewport, transform } = useAtomValue(zoomAtom)
  const [commentRef, commentRect] = useMeasure()
  const [triggerRef, triggerRect] = useMeasure()

  if (comment?.resolved_at !== null && comment?.id !== currentCanvasCommentId) {
    return null
  }

  const isHighlighted = hoveredCanvasCommentId === comment?.id && !!hoveredCanvasCommentId
  const isExpanded = (isHovering || isHighlighted) && !isOpen
  const { side, translateY } = getTranslation({
    coordinates,
    transform,
    triggerRect,
    commentRect,
    viewport
  })
  const hasServerComment = comment?.id && comment.id !== comment?.optimistic_id
  const transition = {
    duration: 0.2,
    ease: [0.16, 1, 0.3, 1]
  }

  return (
    <m.div
      className={cn('absolute -translate-y-[32px]', {
        'z-[3]': isOpen,
        'z-[2]': isExpanded || isHighlighted,
        'z-[1]': !isOpen && !isExpanded && !isHighlighted
      })}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <PopoverPrimitive.Root
        open={isOpen}
        onOpenChange={(open) => {
          if (open) {
            comment && onSelected?.(comment.id)
          }
        }}
      >
        <PopoverPrimitive.Trigger
          ref={triggerRef}
          className={cn('group relative rounded-[40px_40px_40px_4px] !ring-0', {
            'transition-transform hover:scale-105': isOpen,
            'scale-125': isOpen && isHighlighted
          })}
          onClick={() => {
            if (isOpen) {
              onDismiss?.()
            }
          }}
        >
          <m.div
            className='relative z-10'
            initial={{ y: 0, x: 0 }}
            animate={{
              y: isExpanded ? -28 : 0,
              x: isExpanded ? 4 : 0
            }}
            transition={transition}
          >
            <CanvasCommentFacepile comment={comment} />
          </m.div>
          {comment && (
            <div
              aria-hidden
              className={cn(
                'absolute bottom-0 left-0 rounded-[20px_20px_20px_2px] group-focus-visible:ring-4 group-focus-visible:ring-blue-500/20',
                {
                  'pointer-events-none': !isExpanded
                }
              )}
            >
              <m.div
                className='dark:bg-elevated flex min-w-[32px] origin-bottom-left items-center overflow-hidden rounded-[inherit] bg-white pr-3 shadow-md ring-1 ring-black/5 transition-shadow hover:shadow-lg dark:shadow-[inset_0px_1px_0px_rgba(255,255,255,0.10),_0px_2px_4px_rgba(0,0,0,0.5),_0px_0px_0px_1px_rgba(0,0,0,1)]'
                initial={{ maxWidth: triggerRect.width, height: 32 }}
                animate={{
                  maxWidth: (isExpanded ? 300 : 0) + triggerRect.width,
                  height: isExpanded ? 64 : 32
                }}
                transition={transition}
              >
                <m.div
                  className='flex flex-col whitespace-nowrap pr-2 text-left'
                  style={{ paddingLeft: triggerRect.width + 8 }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: isExpanded ? 1 : 0
                  }}
                  transition={transition}
                >
                  <div className='flex gap-1.5'>
                    <UIText primary weight='font-medium' size='text-sm'>
                      {comment.member.user.display_name}
                    </UIText>
                    <UIText tertiary size='text-sm'>
                      <RelativeTime time={comment.created_at} />
                    </UIText>
                  </div>
                  <div className='line-clamp-1 opacity-60'>
                    <CommentDescription
                      subjectId={post.id}
                      subjectType='Post'
                      comment={comment}
                      isEditing={false}
                      isReply={false}
                      setIsEditing={() => {
                        return
                      }}
                    />
                  </div>
                </m.div>
              </m.div>
            </div>
          )}

          {/* Adds the correct shadows around the facepile for optimistic comments */}
          {!comment && (
            <div
              aria-hidden
              className={cn(
                'pointer-events-none absolute bottom-0 left-0 rounded-[20px_20px_20px_2px] group-focus-visible:ring-4 group-focus-visible:ring-blue-500/20'
              )}
            >
              <m.div
                className='dark:bg-elevated flex min-w-[32px] origin-bottom-left items-center overflow-hidden rounded-[inherit] bg-white pr-3 shadow-md ring-1 ring-black/5 transition-shadow hover:shadow-lg dark:shadow-[inset_0px_1px_0px_rgba(255,255,255,0.10),_0px_2px_4px_rgba(0,0,0,0.5),_0px_0px_0px_1px_rgba(0,0,0,1)]'
                initial={{ maxWidth: triggerRect.width, height: 32 }}
                transition={transition}
              />
            </div>
          )}
        </PopoverPrimitive.Trigger>

        <AnimatePresence>
          {isOpen && (
            <PopoverPrimitive.Content
              forceMount
              ref={popoverRef}
              asChild
              avoidCollisions={false}
              side={side}
              sideOffset={8}
              collisionPadding={8}
              align='start'
              onKeyDownCapture={(evt) => {
                jumpIntoView()
                if (evt.key === 'Escape') {
                  evt.preventDefault()
                  evt.stopPropagation()
                  onDismiss?.()
                }
              }}
              className='relative z-[11]'
            >
              <m.div
                ref={commentRef}
                className='scrollable w-[365px] outline-none'
                style={{
                  translateY,
                  // Hide comment until it has been measured
                  opacity: !commentRect.width ? 0 : undefined
                }}
              >
                <m.div
                  {...ANIMATION_CONSTANTS}
                  className={cn(
                    'bg-elevated flex w-full flex-col rounded-xl shadow-lg shadow-black/20 ring-1 ring-black/[0.04] dark:shadow-[inset_0px_1px_0px_rgba(255,255,255,0.04),_0px_2px_12px_rgba(0,0,0,0.4),_0px_0px_0px_1px_rgba(0,0,0,0.8)] dark:ring-white/[0.02]',
                    'origin-[--radix-popover-content-transform-origin]'
                  )}
                  data-zoom-wheel-disabled
                >
                  <div ref={commentContainerRef} className='max-h-[400px] w-full overflow-y-auto'>
                    {comment && <CommentComponent isCanvas comment={comment} post={post} />}
                  </div>

                  <div
                    className={cn('pt-1', {
                      'border-t': !!comment
                    })}
                  >
                    <PostCommentComposer
                      maxHeight='120px'
                      placeholder={hasServerComment ? 'Write a reply...' : 'Write a comment...'}
                      replyingToCommentId={hasServerComment ? comment.id : undefined}
                      onCreated={(comment) => {
                        if (!hasServerComment) {
                          onCreate?.(comment.id)
                          requestAnimationFrame(() => {
                            popoverRef.current?.focus()
                          })
                        }

                        setTimeout(() => {
                          commentContainerRef.current?.scrollTo({
                            left: 0,
                            top: commentContainerRef.current?.scrollHeight,
                            behavior: 'smooth'
                          })
                        }, 20)
                      }}
                      attachmentId={attachmentId}
                      closeComposer={onDismiss}
                      autoFocus={!comment}
                      initialValues={!comment ? coordinates : undefined}
                      display='inline'
                      postId={post.id}
                    />
                  </div>
                </m.div>
              </m.div>
            </PopoverPrimitive.Content>
          )}
        </AnimatePresence>
      </PopoverPrimitive.Root>
    </m.div>
  )
}

function CanvasCommentFacepile({ comment }: { comment: Comment | undefined }) {
  const { data: currentUser } = useGetCurrentUser()
  const uniqueAuthors = useMemo(() => {
    if (!comment) return [{ ...currentUser, type_name: 'user' } as User]

    const set = new Set()

    return [comment.member.user, comment.replies.map((r) => r.member.user)].flat().filter((user) => {
      if (set.has(user.id)) {
        return false
      }
      set.add(user.id)
      return true
    })
  }, [comment, currentUser])

  return (
    <span className='dark:bg-elevated relative z-10 flex cursor-pointer overflow-hidden rounded-[40px_40px_40px_4px] bg-white p-1 transition-all'>
      <FacePile size='sm' limit={2} users={uniqueAuthors} showTooltip={false} />
    </span>
  )
}
