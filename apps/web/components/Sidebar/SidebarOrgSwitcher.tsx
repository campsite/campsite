import { useRef, useState } from 'react'
import { Reorder } from 'framer-motion'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'
import { isMacOs } from 'react-device-detect'

import { PublicOrganization } from '@campsite/types'
import { Avatar, LayeredHotkeys, Link, PlusIcon, Tooltip } from '@campsite/ui'
import { useIsDesktopApp } from '@campsite/ui/src/hooks'
import { cn } from '@campsite/ui/src/utils'

import { OrganizationSwitchHoverCard } from '@/components/InboxItems/OrganizationSwitchHoverCard'
import { sidebarCollapsedAtom } from '@/components/Layout/AppLayout'
import { useScope } from '@/contexts/scope'
import { useGetOrganizationMemberships } from '@/hooks/useGetOrganizationMemberships'
import { useGetUnreadNotificationsCount } from '@/hooks/useGetUnreadNotificationsCount'
import { useReorderOrganizationMemberships } from '@/hooks/useReorderOrganizationMemberships'

export function SidebarOrgSwitcher() {
  const isDesktopApp = useIsDesktopApp()
  const { data: memberships } = useGetOrganizationMemberships()
  const collapsed = useAtomValue(sidebarCollapsedAtom)
  const { onReorder, mutation: reorder } = useReorderOrganizationMemberships()
  const [draggingId, setDraggingId] = useState<undefined | string>()
  const containerRef = useRef<HTMLDivElement>(null)
  const organizationMembershipIds = memberships?.map((membership) => membership.id)

  if (collapsed || !organizationMembershipIds) return null

  return (
    <div
      className={cn('h-screen w-12', {
        'pt-11.5': isMacOs && isDesktopApp
      })}
    >
      <div
        className={cn(
          'bg-secondary scrollbar-hide relative flex h-full w-full flex-col items-center gap-3 overflow-y-auto border-r py-3',
          {
            'rounded-tr-md border-t': isMacOs && isDesktopApp
          }
        )}
      >
        <Reorder.Group
          ref={containerRef}
          axis='y'
          values={organizationMembershipIds}
          onReorder={onReorder}
          className='flex flex-col gap-3'
        >
          {memberships?.map(({ id, organization }, index) => (
            <Reorder.Item
              key={id}
              value={id}
              id={id}
              drag={!collapsed}
              layout='position'
              dragConstraints={containerRef}
              dragElastic={0.065}
              onDragStart={() => setDraggingId(id)}
              onDragEnd={() => {
                setDraggingId(undefined)
                reorder.mutate(organizationMembershipIds)
              }}
              className={cn('group/reorder-item relative', {
                'opacity-60': draggingId === id,
                'pointer-events-none': !!draggingId
              })}
            >
              <OrgSidebarItem organization={organization} index={index} isDragging={draggingId === id} />
            </Reorder.Item>
          ))}
          <Tooltip label='New organization' side='right'>
            <span>
              <Link
                draggable={false}
                className={cn(
                  'group relative flex h-6 w-6 items-center justify-center gap-2 rounded-[5px] bg-black/10 ring-offset-2 ring-offset-gray-50 hover:bg-black/15 focus:ring-black/20 dark:bg-white/10 dark:ring-offset-gray-900 dark:hover:bg-white/20 dark:focus:ring-white/50',
                  {}
                )}
                href={`/new`}
              >
                <PlusIcon className='opacity-50 group-hover:opacity-100' size={18} strokeWidth='2' />
              </Link>
            </span>
          </Tooltip>
        </Reorder.Group>
      </div>
    </div>
  )
}

function OrgSidebarItem({
  organization,
  index,
  isDragging
}: {
  organization: PublicOrganization
  index: number
  isDragging: boolean
}) {
  const { scope } = useScope()
  const router = useRouter()
  const isDesktopApp = useIsDesktopApp()
  const unreadCounts = useGetUnreadNotificationsCount()

  const isSelected = scope === organization.slug
  const inboxCount = unreadCounts.data?.home_inbox[organization.slug]
  const messagesCount = unreadCounts.data?.messages[organization.slug]
  const unreadCount = (inboxCount || 0) + (messagesCount || 0)
  const showUnread = unreadCount > 0 && !isSelected

  const shortcutKey = `mod+${index + 1}`
  const shortcutEnabled = isDesktopApp && index < 9

  return (
    <>
      <LayeredHotkeys
        keys={shortcutKey}
        callback={() => router.push(`/${organization.slug}`)}
        options={{ enabled: shortcutEnabled, enableOnContentEditable: true, enableOnFormTags: true }}
      />

      <OrganizationSwitchHoverCard
        organization={organization}
        shortcut={shortcutEnabled ? shortcutKey : undefined}
        alignOffset={isDesktopApp && index === 0 ? -12 : -44}
        disabled={isDragging}
      >
        <span>
          <Link
            key={organization.id}
            className={cn(
              'relative flex gap-2 rounded-[5px] ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900',
              {
                'ring-2 ring-black focus:ring-black dark:ring-white/90 dark:focus:ring-white/90': isSelected
              }
            )}
            href={`/${organization.slug}`}
            draggable={false}
          >
            <Avatar
              rounded='rounded-[5px]'
              key={organization.id}
              size='sm'
              name={organization.name}
              urls={organization.avatar_urls}
            />

            {showUnread && (
              <div
                className='absolute right-px top-px h-2 w-2 rounded-full bg-blue-500 ring-2 ring-gray-50 dark:ring-gray-900'
                style={{ transform: 'translate(50%, -50%)' }}
              />
            )}
          </Link>
        </span>
      </OrganizationSwitchHoverCard>
    </>
  )
}
