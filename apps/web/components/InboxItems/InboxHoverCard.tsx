import { ComponentPropsWithoutRef, PropsWithChildren, useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'

import { FollowUp, Notification, PublicOrganization } from '@campsite/types'
import { AlarmIcon, Button, DotsHorizontal, InboxIcon, LayeredHotkeys, Link, LoadingSpinner } from '@campsite/ui'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { buildMenuItems } from '@campsite/ui/Menu'
import { HoverCard } from '@campsite/ui/src/HoverCard'
import { cn } from '@campsite/ui/src/utils'

import { EmptyState } from '@/components/EmptyState'
import { DeleteAllNotificationsDialog } from '@/components/InboxItems/DeleteAllNotificationsDialog'
import { useInboxSetSelection } from '@/components/InboxItems/hooks/useInboxSelectedItemId'
import { InboxNotificationItem } from '@/components/InboxItems/InboxNotificationItem'
import { defaultInboxView, InboxView } from '@/components/InboxItems/InboxSplitView'
import { isNotification } from '@/components/InboxItems/utils'
import { sidebarCollapsedAtom } from '@/components/Layout/AppLayout'
import { useGetArchivedNotifications } from '@/hooks/useGetArchivedNotifications'
import { useGetFollowUps } from '@/hooks/useGetFollowUps'
import { useGetNotifications } from '@/hooks/useGetNotifications'
import { useMarkAllNotificationsRead } from '@/hooks/useMarkAllNotificationsRead'
import { useMarkNotificationRead } from '@/hooks/useMarkNotificationRead'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { getInboxItemSplitViewPath } from '@/utils/getInboxItemRoutePath'

import { FollowUpListItem } from './FollowUpListItem'

export function InboxHoverCard({ children, alignOffset = -44 }: { children: React.ReactNode; alignOffset?: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const [view, setInboxView] = useState<InboxView>(defaultInboxView)

  const getNotifications = useGetNotifications({
    enabled: open,
    filter: 'home'
  })
  const getArchivedNotifications = useGetArchivedNotifications({
    enabled: open
  })
  const getFollowUps = useGetFollowUps({ enabled: open })

  const notifications = useMemo(() => flattenInfiniteData(getNotifications.data), [getNotifications.data])
  const archivedNotifications = useMemo(
    () => flattenInfiniteData(getArchivedNotifications.data),
    [getArchivedNotifications.data]
  )
  const followUps = useMemo(() => flattenInfiniteData(getFollowUps.data), [getFollowUps.data])

  const hasNotifications = !!notifications?.length
  const hasArchivedNotifications = !!archivedNotifications?.length
  const hasFollowUps = !!followUps?.length

  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)
  const isViewingInbox = router.pathname.startsWith('/[org]/inbox/[inboxView]')
  const disabled = sidebarCollapsed || isViewingInbox

  if (open && disabled) setOpen(false)

  return (
    <HoverCard
      open={open}
      onOpenChange={(newVal) => {
        setOpen(newVal)
        if (!newVal) setInboxView(defaultInboxView)
      }}
    >
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>

      <HoverCard.Content sideOffset={4} alignOffset={alignOffset}>
        <HoverCard.Content.TitleBar>
          <span className='flex w-full gap-3'>
            <span className='flex flex-1 gap-1'>
              <Button onClick={() => setInboxView('updates')} variant={view === 'updates' ? 'flat' : 'plain'}>
                Updates
              </Button>
              <Button onClick={() => setInboxView('archived')} variant={view === 'archived' ? 'flat' : 'plain'}>
                Archived
              </Button>
              <Button onClick={() => setInboxView('later')} variant={view === 'later' ? 'flat' : 'plain'}>
                Later
              </Button>
            </span>
            <div className={cn(!notifications && 'hidden', view === 'updates' ? 'visible' : 'invisible')}>
              <InboxFilterButtons notifications={notifications} />
            </div>
          </span>
        </HoverCard.Content.TitleBar>

        {view == 'updates' && (
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
        )}

        {view == 'archived' && (
          <>
            {hasArchivedNotifications && <NotificationsList notifications={archivedNotifications} />}

            {!hasArchivedNotifications && !getArchivedNotifications.isLoading && (
              <div className='flex flex-1 items-center justify-center px-6'>
                <EmptyState icon={<InboxIcon className='text-quaternary' size={44} />} />
              </div>
            )}

            {!hasArchivedNotifications && getArchivedNotifications.isLoading && (
              <div className='flex flex-1 items-center justify-center px-6'>
                <LoadingSpinner />
              </div>
            )}
          </>
        )}

        {view == 'later' && (
          <>
            {hasFollowUps && <FollowUpList followUps={followUps} />}

            {!hasFollowUps && !getFollowUps.isLoading && (
              <div className='flex flex-1 items-center justify-center px-6'>
                <EmptyState icon={<AlarmIcon className='text-quaternary' size={44} />} />
              </div>
            )}

            {!hasFollowUps && getFollowUps.isLoading && (
              <div className='flex flex-1 items-center justify-center px-6'>
                <LoadingSpinner />
              </div>
            )}
          </>
        )}
      </HoverCard.Content>
    </HoverCard>
  )
}

export function InboxHoverCardItemLink({
  view,
  notification,
  children
}: PropsWithChildren & { view: InboxView; notification: Notification | FollowUp }) {
  const { setInboxSelection } = useInboxSetSelection()
  const { mutate: markNotificationRead } = useMarkNotificationRead()

  return (
    <Link
      href={getInboxItemSplitViewPath(view, notification)}
      className={cn(
        'dark:focus:bg-tertiary hover:bg-tertiary group relative -mx-1 flex min-h-12 flex-none cursor-pointer scroll-m-2 scroll-mt-12 items-start gap-3 rounded-lg p-2.5 focus-within:border-none focus-within:outline-none focus-within:ring-0 focus:border-none focus:outline-none focus:ring-0'
      )}
      onClick={() => {
        setInboxSelection(notification.id)

        // only mark notifications read on click
        if (isNotification(notification)) {
          markNotificationRead(notification.id)
        }
      }}
    >
      {children}
    </Link>
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

function FollowUpList({ followUps }: { followUps: FollowUp[] }) {
  return (
    <div className='scrollbar-hide flex max-h-[420px] flex-col gap-px overflow-y-auto overscroll-contain p-2'>
      {followUps.map((n) => (
        <InboxHoverCardItemLink view='later' notification={n} key={n.id}>
          <FollowUpListItem followUp={n} />
        </InboxHoverCardItemLink>
      ))}
    </div>
  )
}

export function InboxFilterButtons({
  notifications,
  organization
}: {
  notifications: Notification[] | undefined
  organization?: PublicOrganization
}) {
  const markAllAsRead = useMarkAllNotificationsRead({ organization })
  const [deleteDialogMode, setDeleteDialogMode] =
    useState<ComponentPropsWithoutRef<typeof DeleteAllNotificationsDialog>['mode']>('closed')
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)

  const hasAnyReadNotifications = notifications?.some((n) => n.read)
  const items = buildMenuItems([
    {
      type: 'item',
      label: 'Mark all read',
      onSelect: () => markAllAsRead.mutate({ home_only: true }),
      disabled: !hasAnyReadNotifications,
      kbd: 'alt+u'
    },
    {
      label: 'Archive read notifications',
      type: 'item',
      onSelect: () => setDeleteDialogMode('read'),
      disabled: !hasAnyReadNotifications,
      kbd: 'shift+backspace'
    },
    {
      label: 'Archive all notifications',
      type: 'item',
      onSelect: () => setDeleteDialogMode('all'),
      disabled: !notifications || notifications.length === 0
    }
  ])

  return (
    <>
      <LayeredHotkeys keys={['shift+backspace']} callback={() => setDeleteDialogMode('read')} />
      <LayeredHotkeys keys='alt+u' callback={() => markAllAsRead.mutate({ home_only: true })} />

      <DeleteAllNotificationsDialog
        organization={organization}
        mode={deleteDialogMode}
        onClose={() => setDeleteDialogMode('closed')}
        homeOnly
      />

      <div className='flex items-center gap-1'>
        <DropdownMenu
          open={dropdownIsOpen}
          onOpenChange={setDropdownIsOpen}
          items={items}
          align='end'
          desktop={{ modal: false, width: 'w-[250px]' }}
          trigger={
            <Button variant='plain' iconOnly={<DotsHorizontal />} accessibilityLabel='Notifications actions dropdown' />
          }
        />
      </div>
    </>
  )
}
