import { UIText } from '@campsite/ui/Text'

import { AuthorLink } from '@/components/AuthorLink'
import { MemberHovercard } from '@/components/InlinePost/MemberHovercard'

export function TimelineEventMemberActor({
  timelineEvent
}: {
  timelineEvent: {
    member_actor: {
      user: {
        username: string
        display_name: string
      }
    } | null
  }
}) {
  const { member_actor } = timelineEvent

  if (!member_actor) return null

  return (
    <MemberHovercard username={member_actor.user.username}>
      <AuthorLink user={member_actor.user as any} className='relative hover:underline'>
        <UIText element='span' primary weight='font-medium' size='text-inherit'>
          {member_actor.user.display_name}
        </UIText>
      </AuthorLink>
    </MemberHovercard>
  )
}
