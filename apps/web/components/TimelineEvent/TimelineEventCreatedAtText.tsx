import { TimelineEvent } from '@campsite/types/generated'
import { RelativeTime } from '@campsite/ui/RelativeTime'
import { UIText } from '@campsite/ui/Text'
import { Tooltip } from '@campsite/ui/Tooltip'

import { longTimestamp } from '@/utils/timestamp'

interface TimelineEventCreatedAtTextProps {
  timelineEvent: TimelineEvent
}

export function TimelineEventCreatedAtText({ timelineEvent }: TimelineEventCreatedAtTextProps) {
  const createdAtTitle = longTimestamp(timelineEvent.created_at)

  return (
    <Tooltip label={createdAtTitle}>
      <UIText element='span' quaternary className='ml-1.5' size='text-inherit'>
        <RelativeTime time={timelineEvent.created_at} />
      </UIText>
    </Tooltip>
  )
}
