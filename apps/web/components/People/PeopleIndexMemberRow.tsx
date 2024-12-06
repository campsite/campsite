import { OrganizationMember, SyncOrganizationMember } from '@campsite/types/generated'
import { Badge, Link, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { GuestBadge } from '@/components/GuestBadge'
import { MemberAvatar } from '@/components/MemberAvatar'
import { useScope } from '@/contexts/scope'
import { useCanHover } from '@/hooks/useCanHover'
import { useIsCommunity } from '@/hooks/useIsCommunity'

export function PeopleIndexMemberRow({
  id,
  member,
  onFocus,
  onPointerMove,
  children
}: {
  id?: string
  member: SyncOrganizationMember | OrganizationMember
  onFocus?: React.FocusEventHandler<HTMLAnchorElement>
  onPointerMove?: React.PointerEventHandler<HTMLAnchorElement>
  children?: React.ReactNode
}) {
  const { scope } = useScope()
  const canHover = useCanHover()
  const isCommunity = useIsCommunity()

  return (
    <li
      className={cn(
        'group relative flex items-center gap-3 rounded-md py-2 pl-3 pr-1.5',
        'data-[state="open"]:bg-tertiary',
        {
          'focus-within:bg-tertiary': canHover
        }
      )}
    >
      <Link
        id={id}
        onFocus={onFocus}
        onPointerMove={onPointerMove}
        href={`/${scope}/people/${member.user.username}`}
        className='absolute inset-0 z-0 rounded-lg focus:ring-0'
      />

      <div className='pointer-events-none flex flex-1 items-center gap-3'>
        <MemberAvatar member={member} size='lg' />

        <div className='flex flex-col'>
          <div className='line-clamp-1 flex min-w-0 flex-1 flex-wrap items-center gap-1.5'>
            <UIText weight='font-medium' className='line-clamp-1 flex'>
              {member.user.display_name}
            </UIText>
            {member.role === 'guest' && <GuestBadge />}
            {member.deactivated && <Badge>Deactivated</Badge>}
          </div>
          {!isCommunity && (
            <UIText tertiary className='line-clamp- truncate'>
              {member.user.email}
            </UIText>
          )}
        </div>
      </div>

      {children}
    </li>
  )
}
