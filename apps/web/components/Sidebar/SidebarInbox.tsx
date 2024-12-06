import { useState } from 'react'
import { useRouter } from 'next/router'

import { InboxIcon } from '@campsite/ui'

import { defaultInboxView } from '@/components/InboxItems/InboxSplitView'
import { useRefetchInboxIndex } from '@/components/NavigationBar/useNavigationTabAction'
import { useScope } from '@/contexts/scope'
import { useGetNotifications } from '@/hooks/useGetNotifications'
import { useGetUnreadNotificationsCount } from '@/hooks/useGetUnreadNotificationsCount'

import { InboxHoverCard } from '../InboxItems/InboxHoverCard'
import { SidebarLink } from './SidebarLink'
import { SidebarUnreadBadge } from './SidebarUnreadBadge'

export function SidebarInbox() {
  const router = useRouter()
  const { scope } = useScope()
  const getUnreadNotificationsCount = useGetUnreadNotificationsCount()
  const unreadInboxCount = getUnreadNotificationsCount.data?.home_inbox[`${scope}`] || 0
  const refetchInbox = useRefetchInboxIndex()

  const [prefetch, setPrefetch] = useState(false)

  useGetNotifications({ filter: 'home', enabled: prefetch })

  const unread = unreadInboxCount > 0

  return (
    <InboxHoverCard>
      <SidebarLink
        id='inbox'
        label='Inbox'
        href={`/${scope}/inbox/${defaultInboxView}`}
        active={router.pathname.startsWith('/[org]/inbox/[inboxView]')}
        leadingAccessory={<InboxIcon />}
        unread={unread}
        trailingAccessory={
          unreadInboxCount > 0 && <SidebarUnreadBadge important={false}>{unreadInboxCount}</SidebarUnreadBadge>
        }
        onClick={() => {
          refetchInbox()
        }}
        onMouseEnter={() => setPrefetch(true)}
        onMouseLeave={() => setPrefetch(false)}
      />
    </InboxHoverCard>
  )
}
