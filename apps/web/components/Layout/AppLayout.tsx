import { nativeWindow } from '@todesktop/client-core'
import { atomWithStorage } from 'jotai/utils'

import { useBreakpoint, useIsDesktopApp } from '@campsite/ui/src/hooks'

import { MobileTabBar, NavigationBar, SignedOutNavigationBar } from '@/components/NavigationBar'
import { RefreshAppBanner } from '@/components/NavigationSidebar/RefreshAppBanner'
import { SidebarContainer } from '@/components/Sidebar'
import { SidebarOrgSwitcher } from '@/components/Sidebar/SidebarOrgSwitcher'
import { useCurrentUserSubscriptions } from '@/hooks/useCurrentUserSubscriptions'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useInboxItemSubscriptions } from '@/hooks/useInboxItemSubscriptions'
import { useMemberStatusSubscriptions } from '@/hooks/useMemberStatusSubscriptions'
import { useShowOrgSwitcherSidebar } from '@/hooks/useShowOrgSwitcherSidebar'

export function AppLayout({ children }: React.PropsWithChildren) {
  const lg = useBreakpoint('lg')
  const { data: currentUser, isLoading } = useGetCurrentUser()
  const showOrgSwitcherSidebar = useShowOrgSwitcherSidebar()

  useMemberStatusSubscriptions()
  useInboxItemSubscriptions()
  useCurrentUserSubscriptions()

  return (
    <>
      {isLoading ? null : currentUser?.logged_in ? !lg ? <NavigationBar /> : null : <SignedOutNavigationBar />}

      <DesktopDragAndExpand />
      <RefreshAppBanner />

      <div className='px-safe flex w-full flex-1 items-stretch overflow-y-auto lg:h-full lg:overflow-hidden'>
        {lg && showOrgSwitcherSidebar && <SidebarOrgSwitcher />}
        {lg && <SidebarContainer />}

        <main className='flex flex-1 flex-col overflow-hidden' id='main'>
          {children}
        </main>
      </div>

      {!lg && <MobileTabBar />}
    </>
  )
}

export const sidebarCollapsedAtom = atomWithStorage('sidebarCollapsed', false)

function DesktopDragAndExpand() {
  const isDesktopApp = useIsDesktopApp()

  if (!isDesktopApp) return null

  return (
    <div
      onDoubleClick={() => isDesktopApp && nativeWindow.maximize()}
      className='drag pointer-events-none fixed left-0 right-0 top-0 h-[--navbar-height] w-full'
    />
  )
}
