/* eslint-disable max-lines */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { m } from 'framer-motion'
import { useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import Router from 'next/router'
import { isMobile } from 'react-device-detect'
import toast from 'react-hot-toast'
import { useInView } from 'react-intersection-observer'

import { WEB_URL } from '@campsite/config/index'
import { OrganizationMember } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { ContextMenu } from '@campsite/ui/ContextMenu'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { useBreakpoint, useCopyToClipboard } from '@campsite/ui/hooks'
import {
  ChatBubbleIcon,
  CircleFilledCloseIcon,
  CopyIcon,
  DotsHorizontal,
  SearchIcon,
  TrashIcon,
  UserCircleIcon
} from '@campsite/ui/Icons'
import { buildMenuItems } from '@campsite/ui/Menu'
import { LazyLoadingSpinner } from '@campsite/ui/Spinner'
import { UIText } from '@campsite/ui/Text'
import { TextField } from '@campsite/ui/TextField'
import { Tooltip } from '@campsite/ui/Tooltip'
import { cn } from '@campsite/ui/utils'

import { UpdateStatusDialog } from '@/components/Home/UpdateStatusDialog'
import { MemberHovercard } from '@/components/InlinePost/MemberHovercard'
import { MemberAvatar } from '@/components/MemberAvatar'
import { getTimestamp } from '@/components/MemberStatus'
import { DeactivateMemberDialog } from '@/components/People/DeactivateMemberDialog'
import { InvitePeopleButton } from '@/components/People/InvitePeopleButton'
import { InvitePeopleDialog } from '@/components/People/InvitePeopleDialog'
import { SidebarCollapsibleButton } from '@/components/Sidebar/SidebarCollapsibleButton'
import { useScope } from '@/contexts/scope'
import { presentUserIdsAtom } from '@/hooks/useCurrentOrganizationPresenceChannel'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetDm } from '@/hooks/useGetDm'
import { useGetOrganizationMember } from '@/hooks/useGetOrganizationMember'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { useScopedStorage } from '@/hooks/useScopedStorage'
import { useSearchOrganizationMembers } from '@/hooks/useSearchOrganizationMembers'
import { useStatusIsExpired } from '@/hooks/useStatusIsExpired'
import { useSyncedMembers } from '@/hooks/useSyncedMembers'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

export const homePeopleSidebarAtom = atomWithStorage('home-people-sidebar', true)

export function HomeSidebar() {
  const [query, setQuery] = useState('')
  const sidebarOpen = useAtomValue(homePeopleSidebarAtom)
  const isLg = useBreakpoint('lg')
  const sidebarVariants = {
    open: { width: 'var(--sidebar-width)', opacity: 1 },
    closed: { width: '0px', opacity: 0 }
  }

  if (isMobile) return null
  if (!isLg) return null

  return (
    <m.div
      key='sidebar'
      initial={sidebarOpen ? 'open' : 'closed'}
      animate={sidebarOpen ? 'open' : 'closed'}
      exit='closed'
      variants={sidebarVariants}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      style={{ minWidth: 0 }}
    >
      <div className='bg-secondary dark:bg-primary relative hidden h-screen w-[--sidebar-width] flex-col overflow-hidden border-l lg:flex'>
        <SearchInput query={query} setQuery={setQuery} />
        <MembersLists query={query} />
      </div>
    </m.div>
  )
}

function MembersLists({ query }: { query: string }) {
  const { data: currentUser } = useGetCurrentUser()
  const { data: searchMembers, isLoading } = useSearchOrganizationMembers({ query })
  const syncMembers = useSyncedMembers()
  const members = useMemo(() => flattenInfiniteData(searchMembers) || [], [searchMembers])
  const [startRef, startInView] = useInView()
  const onlineUserIds = useAtomValue(presentUserIdsAtom)

  const { onlineMembers, offlineMembers, guests } = useMemo(() => {
    const memberRoles = ['admin', 'member', 'viewer']

    const onlineTeamMembers =
      members &&
      members
        .filter((member) => onlineUserIds.has(member.user.id))
        .filter((member) => memberRoles.includes(member.role))
        .sort((a, b) => a.user.display_name.localeCompare(b.user.display_name))
        .sort((a) => (a.user.id === currentUser?.id ? -1 : 0))
    const offlineTeamMembers =
      members &&
      members
        .filter((member) => !onlineUserIds.has(member.user.id))
        .filter((member) => memberRoles.includes(member.role))
        .sort((a, b) => a.user.display_name.localeCompare(b.user.display_name))
    const guests = members
      .filter((member) => member.role === 'guest')
      .sort((a, b) => a.user.display_name.localeCompare(b.user.display_name))

    return { onlineMembers: onlineTeamMembers, offlineMembers: offlineTeamMembers, guests }
  }, [currentUser?.id, members, onlineUserIds])

  const hasAnyMembers = onlineMembers.length > 0 || offlineMembers.length > 0 || guests.length > 0
  const showUpsell = syncMembers && syncMembers.members.length === 1

  if (isLoading) return <LazyLoadingSpinner delay={1000} />
  if (!hasAnyMembers) return <SearchNoResults />

  return (
    <div
      className={cn(
        'scrollbar-hide -mt-px flex flex-1 flex-col overflow-y-auto overscroll-contain border-t p-1.5 pt-0',
        {
          'border-transparent': startInView,
          'border-primary': !startInView
        }
      )}
    >
      <div ref={startRef} />
      <OnlineMembers members={onlineMembers} query={query} />
      <OfflineMembers members={offlineMembers} query={query} />
      <Guests members={guests} query={query} />
      {showUpsell && <Upsell />}
    </div>
  )
}

function Upsell() {
  const [copy, copied] = useCopyToClipboard()
  const inviteLink = useGetCurrentOrganization().data?.invitation_url

  return (
    <div className='mt-4 flex w-full flex-col px-1.5'>
      <InvitePeopleButton variant='flat' />

      {inviteLink && (
        <Button
          size='sm'
          variant='plain'
          className={cn('mt-2 hover:bg-transparent dark:hover:bg-transparent', {
            'text-green-500': copied,
            'text-blue-500': !copied
          })}
          onClick={() => copy(inviteLink)}
        >
          {copied ? 'Copied' : 'Copy invite link'}
        </Button>
      )}
    </div>
  )
}

function OnlineMembers({ members, query }: { members: OrganizationMember[]; query: string }) {
  const { data: currentUser } = useGetCurrentUser()
  const [collapsed, setCollapsed] = useScopedStorage('home-online-members-collapsed', false)

  if (members.length === 0) return null

  return (
    <>
      <div className='flex px-1 pt-2'>
        {query ? (
          <div className='flex-1 px-1 py-1'>
            <UIText size='text-xs' tertiary weight='font-medium'>
              Online
            </UIText>
          </div>
        ) : (
          <SidebarCollapsibleButton
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            label={`${members.length} online`}
          />
        )}
      </div>

      {(query || !collapsed) && (
        <ul className='px-1'>
          {members.map((member) => {
            const viewerIsMember = currentUser?.id === member.user.id

            if (viewerIsMember) return <CurrentUserStatus key={member.user.id} />
            return <SidebarMember key={member.id} username={member.user.username} />
          })}
        </ul>
      )}
    </>
  )
}

function OfflineMembers({ members, query }: { members: OrganizationMember[]; query: string }) {
  const [collapsed, setCollapsed] = useScopedStorage('home-offline-members-collapsed', false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  if (members.length === 0) return null

  return (
    <div className='group'>
      <div className='px-1 pt-5'>
        <div className='flex items-center gap-px'>
          <InvitePeopleDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />

          {query ? (
            <div className='flex-1 px-1 py-1'>
              <UIText size='text-xs' tertiary weight='font-medium'>
                Team
              </UIText>
            </div>
          ) : (
            <SidebarCollapsibleButton collapsed={collapsed} setCollapsed={setCollapsed} label='Team' />
          )}

          <button
            onClick={() => setInviteDialogOpen(true)}
            className={cn(
              'hover:bg-quaternary text-tertiary hover:text-primary group flex items-center justify-center rounded-md px-1.5 py-0.5 text-xs opacity-0 focus:outline-0 focus:ring-0 group-hover:opacity-100 group-has-[[data-state="open"]]:opacity-100',
              {
                'opacity-100': inviteDialogOpen
              }
            )}
          >
            Invite
          </button>
        </div>
      </div>

      {(query || !collapsed) && (
        <ul className='px-1'>
          {members.map((member) => (
            <SidebarMember key={member.id} username={member.user.username} />
          ))}
        </ul>
      )}
    </div>
  )
}

function Guests({ members, query }: { members: OrganizationMember[]; query: string }) {
  const [collapsed, setCollapsed] = useScopedStorage('home-guests-collapsed', false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  if (members.length === 0) return null

  return (
    <div className='group'>
      <div className='px-1 pt-5'>
        <div className='flex items-center gap-px'>
          <InvitePeopleDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />

          {query ? (
            <div className='flex-1 px-1 py-1'>
              <UIText size='text-xs' tertiary weight='font-medium'>
                Guests
              </UIText>
            </div>
          ) : (
            <SidebarCollapsibleButton collapsed={collapsed} setCollapsed={setCollapsed} label='Guests' />
          )}

          <button
            onClick={() => setInviteDialogOpen(true)}
            className={cn(
              'hover:bg-quaternary text-tertiary hover:text-primary group flex items-center justify-center rounded-md px-1.5 py-0.5 text-xs opacity-0 focus:outline-0 focus:ring-0 group-hover:opacity-100 group-has-[[data-state="open"]]:opacity-100',
              {
                'opacity-100': inviteDialogOpen
              }
            )}
          >
            Invite
          </button>
        </div>
      </div>

      {(query || !collapsed) && (
        <ul className='px-1'>
          {members.map((member) => (
            <SidebarMember key={member.id} username={member.user.username} />
          ))}
        </ul>
      )}
    </div>
  )
}

function SearchNoResults() {
  const [copy, copied] = useCopyToClipboard()
  const inviteLink = useGetCurrentOrganization().data?.invitation_url

  return (
    <div className='flex flex-1 flex-col items-center justify-center px-3'>
      <SearchIcon className='opacity-20' size={48} />
      <UIText quaternary className='mb-5 mt-1 text-balance text-center'>
        Nobody found
      </UIText>

      <InvitePeopleButton variant='flat' />

      {inviteLink && (
        <Button
          size='sm'
          variant='plain'
          className={cn('mt-2 hover:bg-transparent dark:hover:bg-transparent', {
            'text-green-500': copied,
            'text-blue-500': !copied
          })}
          onClick={() => copy(inviteLink)}
        >
          {copied ? 'Copied' : 'Copy invite link'}
        </Button>
      )}
    </div>
  )
}

function SearchInput({ query, setQuery }: { query: string; setQuery: (query: string) => void }) {
  return (
    <div className='text-quaternary relative'>
      <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2' />
      <TextField
        additionalClasses='bg-transparent pl-10 h-[--navbar-height] focus:ring-0 pr-10 dark:bg-transparent rounded-none border-0'
        placeholder='Search people...'
        value={query}
        onChange={setQuery}
      />
      {query && (
        <button
          className='text-quaternary hover:text-secondary absolute right-3 top-1/2 -translate-y-1/2'
          onClick={() => setQuery('')}
        >
          <CircleFilledCloseIcon />
        </button>
      )}
    </div>
  )
}

export function CurrentUserStatus() {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const { data: currentUser } = useGetCurrentUser()
  const { data: member } = useGetOrganizationMember({ username: currentUser?.username })

  if (!currentUser || !member) return null

  return (
    <>
      <UpdateStatusDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen} />
      <MemberOverflowMenu type='context' member={member}>
        <button
          onClick={() => setStatusDialogOpen(true)}
          className={cn(
            'hover:bg-tertiary group relative flex w-full items-center gap-3 rounded-md py-2 pl-2 pr-1.5 text-left',
            'data-[state="open"]:bg-tertiary'
          )}
        >
          <div className='flex flex-1 items-center gap-3'>
            <MemberAvatar displayStatus member={{ user: currentUser }} size='base' />
            <div className='flex flex-1 flex-col'>
              <UIText className='line-clamp-1'>{currentUser.display_name}</UIText>
              <Status status={member.status} />

              {!member.status && (
                <UIText
                  inherit
                  className='text-quaternary group-hover:text-secondary line-clamp-1 text-[13px] leading-snug'
                >
                  Update status
                </UIText>
              )}
            </div>
          </div>
        </button>
      </MemberOverflowMenu>
    </>
  )
}

function SidebarMember({ username }: { username: string }) {
  const { data: member } = useGetOrganizationMember({ username })

  if (!member) return null
  return <InnerMember member={member} />
}

function InnerMember({ member }: { member: OrganizationMember }) {
  const { scope } = useScope()
  const { data } = useGetDm({ username: member.user.username })
  const existingThread = data?.dm
  const { data: currentUser } = useGetCurrentUser()
  const memberIsViewer = currentUser?.id === member?.user.id
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)

  return (
    <MemberHovercard username={member.user.username} side='left' align='start'>
      <UpdateStatusDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen} />
      <MemberOverflowMenu type='context' member={member}>
        <button
          onClick={() => {
            if (memberIsViewer) {
              setStatusDialogOpen(true)
            } else if (existingThread) {
              Router.push(`/${scope}/chat/${existingThread.id}`)
            } else {
              Router.push(`/${scope}/chat/new?username=${member.user.username}`)
            }
          }}
          className={cn(
            'hover:bg-tertiary group relative flex w-full items-center gap-3 rounded-md py-2 pl-2 pr-1.5 text-left',
            'data-[state="open"]:bg-tertiary'
          )}
        >
          <div className='flex flex-1 items-center gap-3'>
            <MemberAvatar displayStatus member={member} size='base' />

            <div className='flex flex-1 flex-col'>
              <UIText className='line-clamp-1 leading-snug'>{member.user.display_name}</UIText>
              <Status status={member.status} />
              {!member.status && memberIsViewer && (
                <UIText
                  inherit
                  className='text-quaternary group-hover:text-secondary line-clamp-1 text-[13px] leading-snug'
                >
                  Update status
                </UIText>
              )}
            </div>
          </div>
        </button>
      </MemberOverflowMenu>
    </MemberHovercard>
  )
}

function Status({ status }: { status: OrganizationMember['status'] }) {
  const updateTimestamp = useCallback(() => {
    const phrase = getTimestamp(status?.expires_at ? new Date(status.expires_at) : null, 'relative')

    return phrase.charAt(0).toLocaleLowerCase() + phrase.slice(1)
  }, [status?.expires_at])

  const [timestamp, setTimestamp] = useState(updateTimestamp())

  useEffect(() => {
    setTimestamp(updateTimestamp())

    const interval = setInterval(() => {
      setTimestamp(updateTimestamp())
    }, 1000 * 60)

    return () => clearInterval(interval)
  }, [updateTimestamp])

  const isExpired = useStatusIsExpired(status)

  if (!status) return null
  if (isExpired) return null

  return (
    <Tooltip label={`${status.message} ${timestamp}`} align='start'>
      <span className='relative z-10'>
        <UIText quaternary className='flex gap-1 text-[13px] leading-snug'>
          <span>{status.emoji}</span>
          <span className='line-clamp-1'>{status.message}</span>
        </UIText>
      </span>
    </Tooltip>
  )
}
interface MemberOverflowMenuProps extends React.PropsWithChildren {
  type: 'dropdown' | 'context'
  member: OrganizationMember
}

function MemberOverflowMenu({ member, type, children }: MemberOverflowMenuProps) {
  const { scope } = useScope()
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false)
  const profileUrl = `${WEB_URL}/${scope}/people/${member.user.username}`
  const [copy] = useCopyToClipboard()
  const { data: currentUser } = useGetCurrentUser()
  const memberIsViewer = currentUser?.id === member.user.id
  const [deactivateDialogIsOpen, setDeactivateDialogIsOpen] = useState(false)
  const isCommunity = useIsCommunity()
  const viewerIsAdmin = useViewerIsAdmin()
  const canDeactivate = viewerIsAdmin && !memberIsViewer

  const items = buildMenuItems([
    !memberIsViewer && {
      type: 'item',
      leftSlot: <ChatBubbleIcon />,
      label: 'Chat',
      onSelect: () => Router.push(`/${scope}/chat/new?username=${member.user.username}`)
    },
    {
      type: 'item',
      leftSlot: <UserCircleIcon />,
      label: memberIsViewer ? 'My profile' : 'View profile',
      onSelect: () => Router.push(profileUrl)
    },
    {
      type: 'separator'
    },
    !isCommunity && {
      type: 'item',
      leftSlot: <CopyIcon />,
      label: 'Copy email',
      onSelect: () => {
        copy(member.user.email)
        toast('Email copied to clipboard')
      }
    },
    {
      type: 'item',
      leftSlot: <CopyIcon />,
      label: 'Copy link to profile',
      onSelect: () => {
        copy(profileUrl)
        toast('Profile URL copied to clipboard')
      }
    },
    {
      type: 'item',
      leftSlot: <CopyIcon />,
      label: 'Copy member ID',
      onSelect: () => {
        copy(member.id)
        toast('Member ID to clipboard')
      }
    },
    canDeactivate && { type: 'separator' },
    canDeactivate && {
      label: 'Deactivate',
      type: 'item',
      leftSlot: <TrashIcon isAnimated />,
      onSelect: () => setDeactivateDialogIsOpen(true),
      destructive: true
    }
  ])

  return (
    <>
      <DeactivateMemberDialog member={member} open={deactivateDialogIsOpen} onOpenChange={setDeactivateDialogIsOpen} />
      {type === 'context' ? (
        <ContextMenu asChild items={items}>
          {children}
        </ContextMenu>
      ) : (
        <DropdownMenu
          open={dropdownIsOpen}
          onOpenChange={setDropdownIsOpen}
          items={items}
          align='end'
          trigger={
            children ?? (
              <Button variant='plain' iconOnly={<DotsHorizontal />} accessibilityLabel='Post actions dropdown' />
            )
          }
        />
      )}
    </>
  )
}
