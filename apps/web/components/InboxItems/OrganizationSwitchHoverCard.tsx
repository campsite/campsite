import { useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'

import { Notification, PublicOrganization } from '@campsite/types'
import { Button, ChatBubbleIcon, InboxIcon, KeyboardShortcut, Link, LoadingSpinner, UIText } from '@campsite/ui'
import { HoverCard } from '@campsite/ui/src/HoverCard'

import { ExistingThreadListItem } from '@/components/Chat/ExistingThreadListItem'
import { EmptyState } from '@/components/EmptyState'
import { InboxHoverCardItemLink } from '@/components/InboxItems/InboxHoverCard'
import { InboxNotificationItem } from '@/components/InboxItems/InboxNotificationItem'
import { defaultInboxView } from '@/components/InboxItems/InboxSplitView'
import { sidebarCollapsedAtom } from '@/components/Layout/AppLayout'
import { useScope } from '@/contexts/scope'
import { useGetNotifications } from '@/hooks/useGetNotifications'
import { useGetOrganization } from '@/hooks/useGetOrganization'
import { useGetThreads } from '@/hooks/useGetThreads'
import { useGetUnreadNotificationsCount } from '@/hooks/useGetUnreadNotificationsCount'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

export function OrganizationSwitchHoverCard({
  organization,
  shortcut,
  children,
  alignOffset = -44,
  disabled
}: {
  organization: PublicOrganization
  shortcut?: string
  children: React.ReactNode
  alignOffset?: number
  disabled?: boolean
}) {
  const { scope } = useScope()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [prefetchOrg, setPrefetchOrg] = useState<string | undefined>(undefined)
  const [subview, setSubview] = useState<'notifications' | 'chat'>('notifications')
  const unreadCounts = useGetUnreadNotificationsCount()
  const unreadInbox = unreadCounts.data?.home_inbox[organization.slug] || 0
  const unreadChats = unreadCounts.data?.messages[organization.slug] || 0
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)
  const isViewingInbox = organization
    ? organization.slug === scope
    : router.pathname.startsWith('/[org]/inbox/[inboxView]')
  const isDisabled = sidebarCollapsed || isViewingInbox || disabled

  if (open && disabled) setOpen(false)

  // prefetch the org if user is hovering to peek the inbox
  useGetOrganization({ org: prefetchOrg, enabled: !!prefetchOrg && open })

  return (
    <HoverCard
      open={open}
      disabled={isDisabled}
      onOpenChange={(newVal) => {
        setOpen(newVal)
        setPrefetchOrg(organization.slug)
      }}
    >
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>

      <HoverCard.Content sideOffset={12} alignOffset={alignOffset}>
        <HoverCard.Content.TitleBar>
          <Link href={`/${scope}/inbox/${defaultInboxView}`} onClick={() => setOpen(false)} className='flex flex-1 p-1'>
            <div className='flex items-center gap-1.5'>
              <UIText weight='font-semibold' className='flex-1'>
                {organization.name}
              </UIText>
              {shortcut && <KeyboardShortcut shortcut={shortcut} />}
            </div>
          </Link>
        </HoverCard.Content.TitleBar>

        <HoverCard.Content.TitleBar>
          <Button
            onClick={() => setSubview('notifications')}
            variant={subview === 'notifications' ? 'flat' : 'plain'}
            className='flex-1'
          >
            <span className='flex items-center gap-1.5'>
              <span>Updates</span>
              {unreadInbox > 0 && <span className='flex h-1.5 w-1.5 flex-none rounded-full bg-blue-500' />}
            </span>
          </Button>
          <Button onClick={() => setSubview('chat')} variant={subview === 'chat' ? 'flat' : 'plain'} className='flex-1'>
            <span className='flex items-center gap-1.5'>
              <span>Chat</span>
              {unreadChats > 0 && <span className='flex h-1.5 w-1.5 flex-none rounded-full bg-blue-500' />}
            </span>
          </Button>
        </HoverCard.Content.TitleBar>

        {subview === 'notifications' && <Notifications organization={organization} open={open} />}
        {subview === 'chat' && <Chat organization={organization} open={open} />}
      </HoverCard.Content>
    </HoverCard>
  )
}

function Chat({ organization, open }: { organization: PublicOrganization; open?: boolean }) {
  const { data: inbox, isLoading } = useGetThreads({ organization, enabled: open })
  const { threads } = inbox || {}
  const hasThreads = !!threads?.length

  return (
    <>
      {hasThreads && (
        <div className='scrollbar-hide flex max-h-[420px] flex-col gap-px overflow-y-auto overscroll-contain p-2'>
          {threads.map((thread) => (
            <ExistingThreadListItem key={thread.id} thread={thread} />
          ))}
        </div>
      )}

      {!hasThreads && !isLoading && (
        <div className='flex flex-1 items-center justify-center px-6'>
          <EmptyState icon={<ChatBubbleIcon className='text-quaternary' size={44} />} />
        </div>
      )}

      {!hasThreads && isLoading && (
        <div className='flex flex-1 items-center justify-center px-6'>
          <LoadingSpinner />
        </div>
      )}
    </>
  )
}

function Notifications({ organization, open }: { organization: PublicOrganization; open?: boolean }) {
  const getNotifications = useGetNotifications({
    enabled: open,
    organization,
    unreadOnly: false,
    filter: 'home'
  })

  const notifications = useMemo(() => flattenInfiniteData(getNotifications.data), [getNotifications.data])
  const hasNotifications = !!notifications?.length

  return (
    <>
      {hasNotifications && <NotificationsList notifications={notifications} />}

      {!hasNotifications && !getNotifications.isLoading && (
        <div className='flex flex-1 items-center justify-center px-6'>
          <EmptyState icon={<InboxIcon className='text-quaternary' size={44} />} />
        </div>
      )}

      {!hasNotifications && getNotifications.isLoading && (
        <div className='flex flex-1 items-center justify-center px-6'>
          <LoadingSpinner />
        </div>
      )}
    </>
  )
}

function NotificationsList({ notifications }: { notifications: Notification[] }) {
  return (
    <div className='scrollbar-hide flex max-h-[420px] flex-col gap-px overflow-y-auto overscroll-contain p-2'>
      {notifications.map((n) => (
        <InboxHoverCardItemLink view='updates' notification={n} key={n.inbox_key}>
          <InboxNotificationItem notification={n} />
        </InboxHoverCardItemLink>
      ))}
    </div>
  )
}
