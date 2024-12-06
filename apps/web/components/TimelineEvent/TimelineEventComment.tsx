import { TimelineEvent } from '@campsite/types'
import { cn, LinearIcon, UIText } from '@campsite/ui'

import { TimelineEventAccessory } from '@/components/TimelineEvent/TimelineEventAccessory'
import { TimelineEventCreatedAtText } from '@/components/TimelineEvent/TimelineEventCreatedAtText'
import { TimelineEventLinearIssueLink } from '@/components/TimelineEvent/TimelineEventLinearAccessories'
import { TimelineEventMemberActor } from '@/components/TimelineEvent/TimelineEventMemberActor'
import { TimelineEventParagraphContainer } from '@/components/TimelineEvent/TimelineEventParagraphContainer'
import {
  isTimelineEventCommentReferencedInLinearExternalRecord,
  isTimelineEventCreatedLinearIssueFromComment,
  TimelineEventCommentReferencedInLinearExternalRecord,
  TimelineEventCreatedLinearIssueFromComment
} from '@/utils/timelineEvents/types'

// ----------------------------------------------------------------------------

interface TimelineEventContainerProps extends React.PropsWithChildren {
  className?: string
}

function TimelineEventContainer({ children, className }: TimelineEventContainerProps) {
  return <div className={cn('relative flex flex-row items-start gap-2 p-3', className)}>{children}</div>
}

// ----------------------------------------------------------------------------

function TimelineEventCommentReferencedInLinearExternalRecordComponent({
  timelineEvent
}: {
  timelineEvent: TimelineEventCommentReferencedInLinearExternalRecord
}) {
  const { external_reference } = timelineEvent

  return (
    <TimelineEventContainer>
      <TimelineEventAccessory className='size-6.5'>
        <LinearIcon />
      </TimelineEventAccessory>

      <TimelineEventParagraphContainer>
        <UIText size='text-inherit' element='span' tertiary>
          Mentioned in
        </UIText>
        <TimelineEventLinearIssueLink externalRecord={external_reference} />
        <TimelineEventCreatedAtText timelineEvent={timelineEvent} />
      </TimelineEventParagraphContainer>
    </TimelineEventContainer>
  )
}
// ----------------------------------------------------------------------------

function TimelineEventCreatedLinearIssueFromCommentComponent({
  timelineEvent
}: {
  timelineEvent: TimelineEventCreatedLinearIssueFromComment
}) {
  const { external_reference, member_actor } = timelineEvent

  return (
    <TimelineEventContainer>
      <TimelineEventAccessory className='size-6.5'>
        <LinearIcon />
      </TimelineEventAccessory>

      <TimelineEventParagraphContainer>
        {member_actor ? (
          <>
            <TimelineEventMemberActor timelineEvent={timelineEvent} />{' '}
            <UIText size='text-inherit' element='span' tertiary>
              created
            </UIText>
          </>
        ) : (
          <UIText size='text-inherit' element='span' tertiary>
            Linear issue created:
          </UIText>
        )}

        <TimelineEventLinearIssueLink externalRecord={external_reference} />
        <TimelineEventCreatedAtText timelineEvent={timelineEvent} />
      </TimelineEventParagraphContainer>
    </TimelineEventContainer>
  )
}

// ----------------------------------------------------------------------------

export function TimelineEventComment({ timelineEvent }: { timelineEvent: TimelineEvent }) {
  if (isTimelineEventCommentReferencedInLinearExternalRecord(timelineEvent)) {
    return <TimelineEventCommentReferencedInLinearExternalRecordComponent timelineEvent={timelineEvent} />
  } else if (isTimelineEventCreatedLinearIssueFromComment(timelineEvent)) {
    return <TimelineEventCreatedLinearIssueFromCommentComponent timelineEvent={timelineEvent} />
  }
}
