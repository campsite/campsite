import { TimelineEvent } from '@campsite/types/generated'
import { UIText } from '@campsite/ui/Text'

import { AuthorLink } from '@/components/AuthorLink'
import { MemberHovercard } from '@/components/InlinePost/MemberHovercard'

export function TimelineEventMemberActor({ timelineEvent }: { timelineEvent: TimelineEvent }) {
  const { member_actor } = timelineEvent

  if (!member_actor) return null

  return (
    <MemberHovercard username={member_actor.user.username}>
      <AuthorLink user={member_actor.user} className='relative hover:underline'>
        <UIText element='span' primary weight='font-medium' size='text-inherit'>
          {member_actor.user.display_name}
        </UIText>
      </AuthorLink>
    </MemberHovercard>
  )
}
