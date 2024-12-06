import pluralize from 'pluralize'

import { Call } from '@campsite/types/generated'
import { UIText } from '@campsite/ui/Text'

import { FollowUpPopover } from '@/components/FollowUp'

export function CallFollowUps({ call }: { call: Call }) {
  const followUpsCount = call.follow_ups.length

  if (followUpsCount === 0) return null

  return (
    <FollowUpPopover modal side='top' align='end' followUps={call.follow_ups}>
      <button
        type='button'
        className='text-quaternary dark:text-tertiary flex cursor-pointer items-center hover:underline'
      >
        <UIText inherit>
          {followUpsCount} {pluralize('follow-up', followUpsCount)}
        </UIText>
      </button>
    </FollowUpPopover>
  )
}
