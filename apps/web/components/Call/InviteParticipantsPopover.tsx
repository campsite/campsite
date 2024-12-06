import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import {
  Button,
  CheckIcon,
  cn,
  CONTAINER_STYLES,
  LinkIcon,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  useCopyToClipboard,
  UserCirclePlusIcon
} from '@campsite/ui'

import { InviteMembersForm } from '@/components/Call/InviteMembersForm'
import { useGetCallRoom } from '@/hooks/useGetCallRoom'
import { useIsOrganizationMember } from '@/hooks/useIsOrganizationMember'

export function InviteParticipantsPopover() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { data: callRoom } = useGetCallRoom({ callRoomId: router.query.callRoomId as string })
  const isOrganizationMember = useIsOrganizationMember()

  useEffect(() => {
    const { query } = router

    if (query.im === 'open') {
      setOpen(true)
      delete query.im
      router.replace({ pathname: router.pathname, query }, undefined, { scroll: false })
    }
  }, [router])

  if (!callRoom?.viewer_can_invite_participants) return null
  if (!isOrganizationMember) return <CopyLinkButton iconOnly />

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='plain' iconOnly={<UserCirclePlusIcon />} accessibilityLabel='Add participants' round />
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent
          sideOffset={16}
          className={cn(CONTAINER_STYLES.base, CONTAINER_STYLES.shadows, 'bg-elevated dark w-[450px] rounded-lg')}
          align='start'
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className='flex max-h-[--radix-popper-available-height] flex-col gap-4 p-3'>
            <InviteMembersForm onSuccess={() => setOpen(false)} />
            <div>
              <CopyLinkButton />
            </div>
          </div>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}

function CopyLinkButton({ iconOnly = false }: { iconOnly?: boolean }) {
  const [copy, isCopied] = useCopyToClipboard()

  function onCopy() {
    if (!isCopied) copy(window.location.href)
  }

  if (iconOnly) {
    return (
      <Button
        variant='plain'
        onClick={onCopy}
        iconOnly={isCopied ? <CheckIcon /> : <LinkIcon />}
        tooltip='Copy link'
        accessibilityLabel='Copy link'
        className={cn({
          '!border-transparent !bg-green-500 !text-white !shadow-none !outline-none !ring-0': isCopied
        })}
        tooltipShortcut={'mod+shift+c'}
        round
      />
    )
  }

  return (
    <Button
      variant='flat'
      fullWidth
      onClick={onCopy}
      leftSlot={isCopied ? <CheckIcon /> : <LinkIcon />}
      className={cn({
        '!border-transparent !bg-green-500 !text-white !shadow-none !outline-none !ring-0': isCopied
      })}
      tooltipShortcut={'mod+shift+c'}
    >
      {isCopied ? 'Copied' : 'Copy link'}
    </Button>
  )
}
