import { useEffect, useState } from 'react'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useRouter } from 'next/router'

import {
  BoltFilledIcon,
  BoltIcon,
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  UIText,
  useIsDesktopApp
} from '@campsite/ui'

import { Activity } from '@/components/Activity/Activity'
import { sidebarCollapsedAtom } from '@/components/Layout/AppLayout'
import { useScope } from '@/contexts/scope'
import { useGetNotifications } from '@/hooks/useGetNotifications'
import { useGetUnreadNotificationsCount } from '@/hooks/useGetUnreadNotificationsCount'

export const activityOpenAtom = atom(false)

export function SidebarActivity() {
  const router = useRouter()
  const [open, setOpen] = useAtom(activityOpenAtom)
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)
  const { scope } = useScope()
  const unreadCount = useGetUnreadNotificationsCount().data?.activity[`${scope}`] || 0
  const isDesktopApp = useIsDesktopApp()
  const [prefetch, setPrefetch] = useState(false)

  useGetNotifications({ filter: 'activity', enabled: prefetch })

  // close the popover whenever the route changes from selecting an activity
  useEffect(() => {
    const handleRouteChange = () => setOpen(false)

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events, setOpen])

  if (open && sidebarCollapsed) setOpen(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          iconOnly={unreadCount > 0 ? <BoltFilledIcon className='text-blue-500' /> : <BoltIcon />}
          accessibilityLabel='Activity'
          variant='plain'
          tooltip={unreadCount > 0 ? `${unreadCount} unread` : 'Activity'}
          tooltipShortcut='g+a'
          onMouseEnter={() => setPrefetch(true)}
          onMouseLeave={() => setPrefetch(false)}
        />
      </PopoverTrigger>
      <PopoverPortal>
        {open && (
          <PopoverContent
            className={cn(
              'animate-scale-fade shadow-popover dark:border-primary-opaque bg-primary relative flex h-[420px] w-[420px] flex-1 origin-[--radix-hover-card-content-transform-origin] flex-col overflow-hidden rounded-lg border border-transparent dark:shadow-[0px_2px_16px_rgba(0,0,0,1)]'
            )}
            sideOffset={4}
            side={isDesktopApp ? 'bottom' : 'right'}
            align='start'
            onOpenAutoFocus={(e) => e.preventDefault()}
            asChild
            addDismissibleLayer
          >
            <div className='flex h-11 w-full flex-none items-center justify-between gap-3 border-b px-3'>
              <UIText weight='font-semibold'>Activity</UIText>
            </div>
            <Activity />
          </PopoverContent>
        )}
      </PopoverPortal>
    </Popover>
  )
}
