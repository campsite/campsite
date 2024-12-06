import { OrganizationMember } from '@campsite/types'
import { Button, ChatBubbleIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { useScope } from '@/contexts/scope'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useIsCommunity } from '@/hooks/useIsCommunity'

interface Props {
  member: OrganizationMember
  fullWidth?: boolean
}

export function MemberChatButton({ member, fullWidth = false }: Props) {
  const { scope } = useScope()
  const { data: currentUser } = useGetCurrentUser()
  const isCommunity = useIsCommunity()

  if (isCommunity) return null
  if (currentUser?.id === member.user.id) return null
  if (member.deactivated) return null

  return (
    <Button
      className={cn(fullWidth && 'flex-none')}
      variant='flat'
      fullWidth={fullWidth}
      leftSlot={<ChatBubbleIcon />}
      disabled={false}
      href={`/${scope}/chat/new?username=${member.user.username}`}
    >
      Message
    </Button>
  )
}
