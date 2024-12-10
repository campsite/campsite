import { m } from 'framer-motion'
import { useAtom, useAtomValue } from 'jotai'
import Router from 'next/router'
import { isMacOs } from 'react-device-detect'
import { useInView } from 'react-intersection-observer'

import { LayeredHotkeys } from '@campsite/ui'
import { useIsDesktopApp } from '@campsite/ui/src/hooks'
import { cn } from '@campsite/ui/src/utils'

import { DesktopAppNavigationButtons } from '@/components/DesktopAppNavigationButtons'
import { sidebarCollapsedAtom } from '@/components/Layout/AppLayout'
import { OrganizationSwitcher } from '@/components/NavigationSidebar/OrganizationSwitcher'
import { BrowserNotificationsUpsell } from '@/components/Sidebar/BrowserNotificationsUpsell'
import { NewPostButton } from '@/components/Sidebar/NewPostButton'
import { SidebarActivity } from '@/components/Sidebar/SidebarActivity'
import { SidebarChatSectionGroup } from '@/components/Sidebar/SidebarChatSectionGroup'
import { SidebarDrafts } from '@/components/Sidebar/SidebarDrafts'
import { SidebarFavoritesGroup } from '@/components/Sidebar/SidebarFavoritesGroup'
import {
  SIDEBAR_SCROLL_CONTAINER_ID,
  SidebarMoreUnreadsBottom,
  SidebarMoreUnreadsTop
} from '@/components/Sidebar/SidebarMoreUnreads'
import { SidebarHome, SidebarMyWorkItems } from '@/components/Sidebar/SidebarMyWorkGroup'
import { SidebarProfile } from '@/components/Sidebar/SidebarProfile'
import { SidebarProjectsGroup } from '@/components/Sidebar/SidebarProjectsGroup'
import { SidebarSearchButton } from '@/components/SidebarSearchButton'
import { useScope } from '@/contexts/scope'
import { useChatSubscriptions } from '@/hooks/useChatSubscriptions'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useIsOrganizationMember } from '@/hooks/useIsOrganizationMember'
import { useLiveOrganizationUpdates } from '@/hooks/useLiveOrganizationUpdates'
import { useProjectSubscriptions } from '@/hooks/useProjectSubscriptions'
import { useShowOrgSwitcherSidebar } from '@/hooks/useShowOrgSwitcherSidebar'

import { RecentlyViewedPopover } from './RecentlyViewed/RecentlyViewedPopover'
import { SidebarGroup } from './SidebarGroup'
import { SidebarInbox } from './SidebarInbox'

export function SidebarContainer() {
  const { scope } = useScope()
  const [collapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom)
  const isDesktopApp = useIsDesktopApp()
  const { data: currentUser } = useGetCurrentUser()
  const isOrgMember = useIsOrganizationMember()
  const showOrgSwitcherSidebar = useShowOrgSwitcherSidebar()

  function handleCollapseSidebar() {
    setSidebarCollapsed((previous) => !previous)
  }

  function goToSearchPage() {
    if (Router.pathname === '/[org]/search') return
    Router.push(`/${scope}/search`)
  }

  // there's nothing to do for logged-out users
  if (!currentUser?.logged_in) return null
  if (!isOrgMember) return null

  return (
    <>
      <LayeredHotkeys keys='BracketLeft' callback={handleCollapseSidebar} />
      <LayeredHotkeys keys='/' callback={goToSearchPage} />

      {/* width spacer */}
      <m.div
        initial={{ width: collapsed ? 0 : 'var(--sidebar-width)' }}
        animate={{ width: collapsed ? 0 : 'var(--sidebar-width)' }}
        transition={{ duration: 0.1, ease: 'linear' }}
      />

      {/* nav container */}
      <div
        key={`${scope}`}
        className={cn(
          'fixed bottom-0 top-0 isolate z-30 h-screen w-[--sidebar-width] transition-[opacity,transform] duration-200',
          {
            'left-0': !showOrgSwitcherSidebar,
            'left-12': showOrgSwitcherSidebar && !collapsed,
            'p-3 pr-5': collapsed,
            'pt-12': collapsed && isMacOs && isDesktopApp,
            '-translate-x-[calc(100%-12px)] opacity-0 focus-within:translate-x-0 focus-within:opacity-100 hover:translate-x-0 hover:opacity-100':
              collapsed,
            'has-[button[aria-expanded=true]]:translate-x-0 has-[button[aria-expanded=true]]:opacity-100': collapsed
          }
        )}
      >
        <SidebarContent />
      </div>
    </>
  )
}

function SidebarContent() {
  const collapsed = useAtomValue(sidebarCollapsedAtom)
  const [topRef, topInView] = useInView()
  const [bottomRef, bottomInView] = useInView()
  const isDesktopApp = useIsDesktopApp()
  const isOrgMember = useIsOrganizationMember()
  const { data: organization } = useGetCurrentOrganization({
    enabled: isOrgMember
  })

  // these are global subscriptions for the entire app. do not disable!
  useChatSubscriptions()
  useProjectSubscriptions()
  useLiveOrganizationUpdates(organization)

  return (
    <nav
      className={cn('bg-primary flex h-full max-h-screen flex-col transition-[opacity,color]', {
        'rounded-md border shadow': collapsed,
        'border-r': !collapsed,
        'pt-10': isDesktopApp && isMacOs && !collapsed
      })}
    >
      <div
        className={cn('relative flex flex-col gap-1.5 border-b p-3 pb-3', {
          'border-primary': !topInView,
          'border-transparent': topInView
        })}
      >
        {isDesktopApp && (
          <div
            className={cn('flex h-[--titlebar-height] items-center gap-0.5', {
              'flex justify-end': isMacOs,
              'justify-between': !isMacOs,
              '-mt-[39px]': isMacOs && !collapsed,
              hidden: collapsed
            })}
          >
            <DesktopAppNavigationButtons />
            <div className='flex items-center gap-0.5'>
              <RecentlyViewedPopover />
              <SidebarActivity />
            </div>
          </div>
        )}

        <div className='flex items-center justify-between'>
          <OrganizationSwitcher />
          {!isDesktopApp && <SidebarActivity />}
        </div>

        <div className='flex flex-1 items-center gap-1'>
          <span className='flex-1'>
            <NewPostButton />
          </span>
          <SidebarSearchButton />
        </div>

        <SidebarMoreUnreadsTop />
      </div>

      <div id={SIDEBAR_SCROLL_CONTAINER_ID} className='scrollbar-hide flex-1 overflow-y-auto overscroll-contain'>
        <div ref={topRef} />

        <SidebarGroup className='pt-0'>
          <SidebarHome />
          <SidebarInbox />
          <SidebarMyWorkItems />
          <SidebarDrafts />
        </SidebarGroup>

        <SidebarFavoritesGroup />
        <SidebarProjectsGroup />
        <SidebarChatSectionGroup />

        <div className='flex-1' />

        <div ref={bottomRef} />
      </div>

      <SidebarGroup
        className={cn('border-t pb-3 pt-1.5', {
          'border-primary': !bottomInView,
          'border-transparent': bottomInView
        })}
      >
        <BrowserNotificationsUpsell />
        <SidebarMoreUnreadsBottom />
        <SidebarProfile />
      </SidebarGroup>
    </nav>
  )
}
