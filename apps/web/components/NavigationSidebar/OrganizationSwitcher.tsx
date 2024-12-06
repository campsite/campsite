import React, { useState } from 'react'
import { useRouter } from 'next/router'
import pluralize from 'pluralize'
import { isMobile } from 'react-device-detect'

import { COMMUNITY_SLUG } from '@campsite/config'
import { PublicOrganization } from '@campsite/types/generated'
import {
  AppsIcon,
  Avatar,
  Badge,
  ChevronSelectIcon,
  FaceSmileIcon,
  GearIcon,
  GlobeIcon,
  PlusIcon,
  ProjectIcon,
  ReorderHandlesIcon,
  UIText,
  useBreakpoint,
  UserCircleIcon
} from '@campsite/ui'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { buildMenuItems } from '@campsite/ui/Menu'
import { cn } from '@campsite/ui/src/utils'

import { useScope } from '@/contexts/scope'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetInboundMembershipRequests } from '@/hooks/useGetInboundMembershipRequests'
import { useGetOrganizationMemberships } from '@/hooks/useGetOrganizationMemberships'
import { useGetUnreadNotificationsCount } from '@/hooks/useGetUnreadNotificationsCount'
import { useViewerCanCreateCustomReaction } from '@/hooks/useViewerCanCreateCustomReaction'
import { useViewerCanManageIntegrations } from '@/hooks/useViewerCanManageIntegrations'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'

export function OrganizationSwitcher({ trigger }: { trigger?: React.ReactNode }) {
  const { scope } = useScope()
  const router = useRouter()
  const isLg = useBreakpoint('lg')
  const [open, setOpen] = useState(false)
  const { viewerCanCreateCustomReaction } = useViewerCanCreateCustomReaction()
  const { viewerCanManageIntegrations } = useViewerCanManageIntegrations()
  const {
    data: memberships,
    isLoading: organizationsLoading,
    refetch: refetchOrganizations
  } = useGetOrganizationMemberships()
  const currentOrganization = memberships?.find((m) => m.organization.slug === scope)?.organization
  const unreadCounts = useGetUnreadNotificationsCount()
  const otherOrgHasUnread =
    !!unreadCounts.data &&
    (Object.entries(unreadCounts.data?.home_inbox).some(([orgSlug, count]) => orgSlug !== scope && count > 0) ||
      Object.entries(unreadCounts.data?.messages).some(([orgSlug, count]) => orgSlug !== scope && count > 0))

  const viewerIsAdmin = useViewerIsAdmin()
  const getMembershipRequests = useGetInboundMembershipRequests({ enabled: viewerIsAdmin })
  const membershipRequests = getMembershipRequests.data
  const hasMembershipRequests = membershipRequests && membershipRequests.data.length > 0
  const { data: organization } = useGetCurrentOrganization()

  // avoid flashing the = Menu button while loading
  if (organizationsLoading || (scope && !currentOrganization)) {
    if (isMobile) {
      return <div className='bg-secondary h-10 w-10 rounded-full' />
    }

    return (
      <div className='flex h-8 flex-1 items-center gap-2 p-1.5'>
        <div className='bg-quaternary h-5 w-5 flex-none rounded-full' />
        <div className='bg-quaternary h-1.5 w-1/2 rounded-full' />
      </div>
    )
  }

  const defaultTrigger = (
    <button className='hover:bg-quaternary relative flex cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-md p-1.5 text-sm focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100'>
      <OrganizationAvatarAndName organization={currentOrganization} />
      <div className='flex items-center gap-1'>
        {isMobile && otherOrgHasUnread && <div className='h-2 w-2 flex-none rounded-full bg-blue-500' />}
        {!isMobile && hasMembershipRequests && <div className='h-2 w-2 flex-none rounded-full bg-blue-500' />}
        <div className='text-tertiary'>
          <ChevronSelectIcon />
        </div>
      </div>
    </button>
  )

  const hasSettings = currentOrganization?.viewer_is_admin
  const hasEmojis = viewerCanCreateCustomReaction && currentOrganization?.slug !== COMMUNITY_SLUG
  const hasIntegrations = viewerCanManageIntegrations && currentOrganization?.slug !== COMMUNITY_SLUG

  const items = buildMenuItems([
    organization?.viewer_can_see_people_index && {
      type: 'item',
      leftSlot: <UserCircleIcon />,
      label: 'People',
      onSelect: () => {
        setOpen(false)
        router.push(`/${scope}/people`)
      },
      rightSlot: hasMembershipRequests && (
        <Badge
          color='blue'
          className='h-4.5 ml-1 flex bg-blue-500 font-mono text-white dark:bg-blue-500 dark:text-white'
        >
          {membershipRequests?.data.length} {pluralize('request', membershipRequests?.data.length)}
        </Badge>
      )
    },
    organization?.viewer_can_see_projects_index && {
      type: 'item',
      leftSlot: <ProjectIcon />,
      label: 'Channels',
      onSelect: () => {
        setOpen(false)
        router.push(`/${scope}/projects`)
      }
    },
    (hasSettings || hasEmojis) && {
      type: 'separator'
    },
    hasSettings && {
      type: 'item',
      leftSlot: <GearIcon />,
      label: 'Settings',
      url: `/${scope}/settings`
    },
    hasEmojis && {
      type: 'item',
      leftSlot: <FaceSmileIcon />,
      label: 'Custom emojis',
      url: `/${scope}/settings/emojis`
    },
    hasIntegrations && {
      type: 'item',
      leftSlot: <AppsIcon />,
      label: 'Integrations',
      url: `/${scope}/settings/integrations`
    }
  ])

  const mobileItems = buildMenuItems(
    memberships
      ?.filter((o) => o.id !== currentOrganization?.id)
      .map(({ organization }) => {
        const unreadCount = unreadCounts.data?.home_inbox[organization.slug] || 0

        return {
          type: 'item',
          label: organization.name,
          url: `/${organization.slug}`,
          leftSlot: (
            <Avatar
              size='xs'
              key={organization.id}
              name={organization.name}
              urls={organization.avatar_urls}
              rounded='rounded'
            />
          ),
          rightSlot: (
            <>
              {organization.slug === COMMUNITY_SLUG && <GlobeIcon />}
              {unreadCount > 0 && (
                <span className='ml-1 flex h-5 items-center justify-center self-center rounded-full bg-blue-500 px-2.5 font-mono text-[10px] font-semibold leading-none text-white'>
                  {unreadCount}
                </span>
              )}
            </>
          )
        }
      })
  )

  const allItems = buildMenuItems([
    ...items,
    !isLg && items.length > 0 && { type: 'separator' },
    ...(!isLg ? mobileItems : []),
    (!isLg || memberships?.length === 1) && {
      type: 'item',
      leftSlot: <PlusIcon />,
      label: 'New organization',
      url: '/new'
    }
  ])

  if (allItems.length === 0) {
    return trigger || <OrganizationAvatarAndName organization={currentOrganization} className='p-1.5' />
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(val) => {
        if (val) refetchOrganizations()
        setOpen(val)
      }}
      align='start'
      sideOffset={4}
      desktop={{ width: 'w-[280px]' }}
      trigger={
        trigger ? (
          <button className='relative flex'>
            {otherOrgHasUnread && (
              <div
                className={cn(
                  'absolute -right-1 -top-1 z-10 h-2.5 w-2.5 flex-none rounded-full bg-blue-500 ring-4 ring-gray-50 dark:ring-gray-900',
                  { 'right-5.5': !isMobile && memberships && memberships.length > 1 }
                )}
              />
            )}
            {trigger}
          </button>
        ) : (
          defaultTrigger
        )
      }
      items={allItems}
    />
  )
}

function OrganizationAvatarAndName({
  organization,
  className
}: {
  organization?: PublicOrganization
  className?: string
}) {
  return (
    <div className={cn('flex min-w-[0] items-center gap-2 text-left', className)}>
      <div className='shrink-0'>
        {organization ? (
          <Avatar
            rounded='rounded'
            key={organization.id}
            size='xs'
            name={organization.name}
            urls={organization.avatar_urls}
          />
        ) : (
          <ReorderHandlesIcon />
        )}
      </div>
      <UIText className='truncate whitespace-nowrap' weight='font-medium'>
        {organization?.name || 'Menu'}
      </UIText>
    </div>
  )
}
