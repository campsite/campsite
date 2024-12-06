import { useEffect, useMemo } from 'react'
import { useSetAtom } from 'jotai'
import Router from 'next/router'
import { useInView } from 'react-intersection-observer'

import { cn, Command, InboxIcon, LoadingSpinner } from '@campsite/ui'

import { EmptyState } from '@/components/EmptyState'
import { NotificationListItem } from '@/components/InboxItems/NotificationListItem'
import { activityOpenAtom } from '@/components/Sidebar/SidebarActivity'
import { useAppFocused } from '@/hooks/useAppFocused'
import { useCanHover } from '@/hooks/useCanHover'
import { useCreateActivityView } from '@/hooks/useCreateActivityView'
import { useGetNotifications } from '@/hooks/useGetNotifications'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { getInboxItemRoutePath } from '@/utils/getInboxItemRoutePath'

export function useTrackActivityView(isLoading: boolean = false) {
  const [ref, inView] = useInView()
  const { mutate: createActivityView } = useCreateActivityView()
  const isAppFocused = useAppFocused()

  useEffect(() => {
    if (isAppFocused && inView && !isLoading) {
      createActivityView({ last_seen_at: new Date().toISOString() })
    }
  }, [inView, createActivityView, isLoading, isAppFocused])

  return ref
}

export function Activity() {
  const getNotifications = useGetNotifications({ filter: 'activity' })
  const notifications = useMemo(() => flattenInfiniteData(getNotifications.data), [getNotifications.data])
  const hasNotifications = !!notifications?.length
  const setActivityOpen = useSetAtom(activityOpenAtom)
  const ref = useTrackActivityView(getNotifications.isLoading)
  const canHover = useCanHover()

  return (
    <>
      {hasNotifications && (
        <Command className='scrollbar-hide overflow-y-auto overscroll-contain' disableAutoSelect>
          <Command.List ref={ref} className='flex flex-col gap-px px-2 py-1'>
            {notifications.map((n) => (
              <Command.Item
                key={n.id}
                onSelect={() => {
                  Router.push(getInboxItemRoutePath(n))
                  setActivityOpen(false)
                }}
                className={cn(
                  'text-primary group relative -mx-1 flex flex-none cursor-pointer select-none scroll-m-2 scroll-mt-12 items-start gap-3 rounded-lg px-2.5 py-3 text-[15px] outline-none ease-in-out will-change-[background,_color] focus-within:border-none focus-within:outline-none focus-within:ring-0 focus:border-none focus:outline-none focus:ring-0',
                  {
                    'bg-blue-500/10 dark:bg-blue-500/20': !n.activity_seen,
                    'hover:bg-blue-500/15 aria-selected:bg-blue-500/15 dark:hover:bg-blue-500/25 dark:aria-selected:bg-blue-500/25':
                      !n.activity_seen && canHover,
                    'hover:bg-tertiary focus:bg-tertiary aria-selected:bg-tertiary': n.activity_seen && canHover
                  }
                )}
              >
                <NotificationListItem notification={n} display='activity' />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      )}

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
