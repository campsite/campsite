import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

import { Comment, Post, TimelineEvent } from '@campsite/types'
import { useCallbackRef } from '@campsite/ui/hooks'
import { cn } from '@campsite/ui/src/utils'

import { scrollCommentsIntoView } from '@/components/InlinePost/InlinePostEngagements'
import { TimelineEventSubject } from '@/components/TimelineEvent'

import { MentionInteractivity } from '../InlinePost/MemberHovercard'
import { CommentComponent } from './Comment'

export function enumerateCommentElements(id: string, fn: (el: Element) => void) {
  const elements = document.querySelectorAll(`[data-comment-id="#comment-${id}"]`)

  if (!elements.length) {
    return false
  }

  elements.forEach((el) => fn(el))

  return true
}

export function useAutoScrollComments({
  onSidebarOpenChange,
  comments,
  canvasCommentId
}: {
  onSidebarOpenChange?: (open: boolean) => void
  comments: Comment[]
  canvasCommentId?: string | null
}) {
  const highlightedCommentHash = useRef<string | null>(null)
  const scrolledIntoViewHash = useRef<string | null>(null)

  const highlightComment = useCallbackRef((id: string, timeout: number = 3000) => {
    if (highlightedCommentHash.current === id) return

    const highlighted = enumerateCommentElements(id, (el) => {
      el.classList.add('bg-blue-300/10')
      setTimeout(() => el.classList.remove('bg-blue-300/10'), timeout)
    })

    if (highlighted) {
      highlightedCommentHash.current = id
    }
  })

  const handleHashChange = useCallbackRef(() => {
    const hash = window.location.hash

    if (!hash) {
      return
    }

    if (scrolledIntoViewHash.current === window.location.hash) return

    if (hash.startsWith('#comments')) {
      if (hash === '#comments-end') {
        scrollCommentsIntoView('end')
      } else {
        scrollCommentsIntoView('start')
      }

      scrolledIntoViewHash.current = hash
      return
    }

    const cleanId = canvasCommentId || hash.replace('#comment-', '')
    const scrolled = enumerateCommentElements(cleanId, (el) => {
      el.scrollIntoView({ block: 'center' })
    })

    if (scrolled) {
      scrolledIntoViewHash.current = hash
    }

    // highlight the comment
    highlightComment(cleanId)

    // opens the note sidebar when entering from a notification
    onSidebarOpenChange?.(true)
  })

  // when the comments first load, scroll to the comments section or specific comment is a hash fragment is present
  useEffect(() => {
    handleHashChange()
  }, [comments, handleHashChange])

  useEffect(() => {
    if (canvasCommentId) {
      highlightComment(canvasCommentId, 2000)
    }
  }, [canvasCommentId, highlightComment])

  // IMPORTANT: nextjs router change events are more reliable than "hashchange" window events
  const router = useRouter()

  useEffect(() => {
    router.events.on('routeChangeComplete', handleHashChange)
    return () => {
      router.events.off('routeChangeComplete', handleHashChange)
    }
  }, [router, handleHashChange])
}

interface Props {
  post: Post
  comments?: Comment[]
  timelineEvents?: TimelineEvent[]
  replyingToCommentId?: string | null
  setReplyingToCommentId?(id: string | null): void
}

export const CommentsList = ({
  comments = [],
  timelineEvents = [],
  post,
  replyingToCommentId,
  setReplyingToCommentId
}: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const mixedItems = [
    ...comments.map((comment) => ({ ...comment, type: 'comment' })),
    ...timelineEvents.map((event) => ({ ...event, type: 'timeline-event' }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  useAutoScrollComments({ comments })

  return (
    <div
      ref={ref}
      id='#comments'
      className={cn('flex flex-col-reverse', {
        '-mt-3': comments.length > 0
      })}
    >
      <MentionInteractivity container={ref} />
      {mixedItems.map((mixedItem) => {
        if (mixedItem.type === 'timeline-event') {
          const timelineEvent = mixedItem as TimelineEvent

          return <TimelineEventSubject key={timelineEvent.id} subjectType='post' timelineEvent={timelineEvent} />
        }

        const comment = mixedItem as Comment

        return (
          <CommentComponent
            key={comment.id}
            post={post}
            comment={comment}
            replyingToCommentId={replyingToCommentId}
            setReplyingToCommentId={setReplyingToCommentId}
          />
        )
      })}
    </div>
  )
}
