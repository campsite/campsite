import { useRef } from 'react'

import { Comment, Note, TimelineEvent } from '@campsite/types'
import { cn } from '@campsite/ui/src/utils'

import { useAutoScrollComments } from '@/components/Comments/CommentsList'
import { TimelineEventSubject } from '@/components/TimelineEvent'

import { MentionInteractivity } from '../InlinePost/MemberHovercard'
import { CommentComponent } from './Comment'

interface Props {
  comments: Comment[]
  timelineEvents: TimelineEvent[]
  note: Note
  onSidebarOpenChange?(open: boolean): void
  hideAttachment?: boolean
}

export const CommentsList = ({ comments, timelineEvents, note, onSidebarOpenChange, hideAttachment }: Props) => {
  const ref = useRef(null)
  const mixedItems = [
    ...comments.map((comment) => ({ ...comment, type: 'comment' })),
    ...timelineEvents.map((event) => ({ ...event, type: 'timeline-event' }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  useAutoScrollComments({
    onSidebarOpenChange,
    comments
  })

  return (
    <div
      className={cn('-mx-3 flex flex-col-reverse', {
        '-mt-3': comments.length > 0
      })}
      id='#comments'
      ref={ref}
    >
      <MentionInteractivity container={ref} />
      {mixedItems.map((mixedItem) => {
        if (mixedItem.type === 'timeline-event') {
          const timelineEvent = mixedItem as TimelineEvent

          return <TimelineEventSubject key={timelineEvent.id} subjectType='note' timelineEvent={timelineEvent} />
        }

        const comment = mixedItem as Comment

        return (
          <div key={comment.id}>
            <CommentComponent note={note} comment={comment} hideAttachment={hideAttachment} />
          </div>
        )
      })}
    </div>
  )
}
