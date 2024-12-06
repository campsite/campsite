import { useState } from 'react'

import { DropdownMenu, DropdownMenuProps } from '@campsite/ui/DropdownMenu'
import { useIsDesktopApp } from '@campsite/ui/hooks'
import { LinkIcon, UserLinkIcon, VideoCameraBoltIcon } from '@campsite/ui/Icons'
import { desktopJoinCall } from '@campsite/ui/Link'
import { MenuItem } from '@campsite/ui/Menu'

import { CallForLaterDialog } from '@/components/Calls/CallForLaterDialog'
import { PersonalCallLinkDialog } from '@/components/Calls/PersonalCallLinkDialog'
import { useCreateCallRoom } from '@/hooks/useCreateCallRoom'

export function NewCallDropdownMenu(props: Omit<DropdownMenuProps, 'items'>) {
  const { mutate: createCallRoom } = useCreateCallRoom()
  const [callForLaterDialogOpen, setCallForLaterDialogOpen] = useState(false)
  const [personalCallLinkDialogOpen, setPersonalCallLinkDialogOpen] = useState(false)
  const isDesktop = useIsDesktopApp()

  const items: MenuItem[] = [
    {
      type: 'item',
      leftSlot: <VideoCameraBoltIcon />,
      label: 'Start an instant call',
      onSelect: () => {
        createCallRoom(
          { source: 'new_call_button' },
          {
            onSuccess: (data) => {
              setTimeout(() => {
                if (isDesktop) {
                  desktopJoinCall(`${data?.url}?im=open`)
                } else {
                  window.open(`${data?.url}?im=open`, '_blank')
                }
              })
            }
          }
        )
      }
    },
    {
      type: 'item',
      leftSlot: <LinkIcon />,
      label: 'Create call link',
      onSelect: () => {
        setCallForLaterDialogOpen(true)
      }
    },
    {
      type: 'item',
      leftSlot: <UserLinkIcon />,
      label: 'Use your personal call link',
      onSelect: () => {
        setPersonalCallLinkDialogOpen(true)
      }
    }
  ]

  return (
    <>
      <DropdownMenu items={items} desktop={{ width: 'w-[250px]' }} {...props} />
      <CallForLaterDialog open={callForLaterDialogOpen} onOpenChange={setCallForLaterDialogOpen} />
      <PersonalCallLinkDialog open={personalCallLinkDialogOpen} onOpenChange={setPersonalCallLinkDialogOpen} />
    </>
  )
}
