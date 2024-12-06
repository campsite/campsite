import { useState } from 'react'

import { Button, ButtonProps } from '@campsite/ui/Button'
import { PlusIcon } from '@campsite/ui/Icons'

import { CommunityInviteDialog } from '@/components/JoinCommunity/CommunityInviteDialog'
import { InvitePeopleDialog } from '@/components/People/InvitePeopleDialog'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useIsCommunity } from '@/hooks/useIsCommunity'

export function InvitePeopleButton({
  variant = 'primary',
  label = 'Invite people',
  fullWidth = false,
  leftSlot = <PlusIcon size={16} strokeWidth='2' />,
  size = 'base'
}: {
  variant?: ButtonProps['variant']
  label?: string
  fullWidth?: boolean
  leftSlot?: React.ReactNode
  size?: ButtonProps['size']
}) {
  const [open, onOpenChange] = useState(false)
  const isCommunity = useIsCommunity()
  const { data: currentOrganization } = useGetCurrentOrganization()

  if (!currentOrganization?.viewer_can_create_invitation) return null

  if (isCommunity) {
    return (
      <>
        <CommunityInviteDialog open={open} onOpenChange={onOpenChange} />
        <Button
          size={size}
          fullWidth={fullWidth}
          variant={variant}
          onClick={() => {
            onOpenChange(true)
          }}
        >
          {label}
        </Button>
      </>
    )
  }

  return (
    <>
      <InvitePeopleDialog open={open} onOpenChange={onOpenChange} />
      <Button
        size={size}
        leftSlot={leftSlot}
        fullWidth={fullWidth}
        onClick={() => onOpenChange(true)}
        variant={variant}
      >
        {label}
      </Button>
    </>
  )
}
