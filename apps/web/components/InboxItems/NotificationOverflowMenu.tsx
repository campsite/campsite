import React, { useState } from 'react'

import { FollowUp, Notification } from '@campsite/types'
import {
  AlarmIcon,
  ContextMenu,
  InboxArchiveIcon,
  InboxUnarchiveIcon,
  ReadSquareBadgeIcon,
  UnreadSquareBadgeIcon
} from '@campsite/ui'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { buildMenuItems } from '@campsite/ui/Menu'

import { useInboxSplitView } from '@/components/InboxItems/InboxSplitView'
import { isNotification } from '@/components/InboxItems/utils'

interface NotificationOverflowMenuProps extends React.PropsWithChildren {
  item: Notification | FollowUp
  type: 'dropdown' | 'context'
}

export function NotificationOverflowMenu({ item, type, children }: NotificationOverflowMenuProps) {
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const inbox = useInboxSplitView()

  if (!inbox) return null

  const items = buildMenuItems([
    isNotification(item) &&
      item.follow_up_subject && {
        type: 'item',
        leftSlot: <AlarmIcon />,
        label: 'Follow up',
        onSelect: () => inbox.triggerFollowUp(item),
        kbd: 'f'
      },
    isNotification(item) && {
      type: 'item',
      leftSlot: item.read ? <UnreadSquareBadgeIcon /> : <ReadSquareBadgeIcon />,
      label: item.read ? 'Mark unread' : 'Mark read',
      onSelect: () => inbox.toggleRead(item),
      kbd: 'u'
    },
    isNotification(item) && item.archived
      ? {
          type: 'item',
          leftSlot: <InboxUnarchiveIcon />,
          label: 'Unarchive notification',
          onSelect: () => inbox.triggerDelete(item),
          kbd: 'e'
        }
      : {
          type: 'item',
          leftSlot: <InboxArchiveIcon />,
          label: 'Archive notification',
          onSelect: () => inbox.triggerDelete(item),
          kbd: 'e'
        }
  ])

  if (type === 'context') {
    return (
      <ContextMenu asChild items={items} onOpenChange={setDropdownIsOpen}>
        {children}
      </ContextMenu>
    )
  }

  return (
    <DropdownMenu
      open={dropdownIsOpen}
      onOpenChange={setDropdownIsOpen}
      items={items}
      align='start'
      trigger={children}
    />
  )
}
