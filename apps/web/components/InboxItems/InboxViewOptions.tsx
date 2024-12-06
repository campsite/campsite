import { ReactNode } from 'react'
import { isMobile } from 'react-device-detect'

import { Button } from '@campsite/ui/Button'

import { useInboxFilterHrefs } from '@/components/InboxItems/hooks/useInboxFilterHrefs'
import { InboxView } from '@/components/InboxItems/InboxSplitView'
import { useGetUnreadNotificationsCount } from '@/hooks/useGetUnreadNotificationsCount'

interface InboxViewOptionsProps {
  view: InboxView
  rightSlot?: ReactNode
  showActivity?: boolean
}

export function InboxViewOptions({ view, rightSlot, showActivity }: InboxViewOptionsProps) {
  const { scope, updatesHref, archivedHref, laterHref, activityHref } = useInboxFilterHrefs()
  const unreadCount = useGetUnreadNotificationsCount().data?.activity[`${scope}`] || 0

  return (
    <span className='flex w-full gap-3'>
      <span className='flex flex-1 gap-0.5'>
        <Button
          href={updatesHref}
          fullWidth={isMobile}
          variant={view === 'updates' ? 'flat' : 'plain'}
          tooltip='Updates'
          tooltipShortcut='1'
        >
          Updates
        </Button>
        <Button
          href={archivedHref}
          fullWidth={isMobile}
          variant={view === 'archived' ? 'flat' : 'plain'}
          tooltip='Archived'
          tooltipShortcut='2'
        >
          Archived
        </Button>
        <Button
          href={laterHref}
          fullWidth={isMobile}
          variant={view === 'later' ? 'flat' : 'plain'}
          tooltip='Later'
          tooltipShortcut='3'
        >
          Later
        </Button>

        {showActivity && (
          <Button
            href={activityHref}
            fullWidth={isMobile}
            variant={view === 'activity' ? 'flat' : 'plain'}
            tooltip='Activity'
            rightSlot={unreadCount > 0 && <div className='h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600' />}
          >
            Activity
          </Button>
        )}
      </span>

      {rightSlot}
    </span>
  )
}
