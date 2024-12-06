/* eslint-disable max-lines */
import { useEffect, useMemo, useState } from 'react'
import { nativeWindow } from '@todesktop/client-core'
import { m } from 'framer-motion'
import { atom, useSetAtom } from 'jotai'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { isMacOs, isMobile } from 'react-device-detect'

import { SITE_URL } from '@campsite/config'
import { Project } from '@campsite/types'
import {
  ArrowLeftIcon,
  Avatar,
  Button,
  ChatBubbleIcon,
  ChevronSelectIcon,
  HomeIcon,
  InboxIcon,
  Link,
  LockIcon,
  Logo,
  PaperAirplaneIcon,
  PlusIcon,
  UIText
} from '@campsite/ui'
import { useHasMounted, useIsDesktopApp } from '@campsite/ui/src/hooks'
import { cn } from '@campsite/ui/src/utils'

import { BackButton } from '@/components/BackButton'
import { CallOverflowMenu } from '@/components/Calls/CallOverflowMenu'
import { CallSharePopover } from '@/components/CallSharePopover'
import { GuestBadge } from '@/components/GuestBadge'
import { InboxFilterButtons } from '@/components/InboxItems/InboxHoverCard'
import { defaultInboxView, InboxView } from '@/components/InboxItems/InboxSplitView'
import { MemberAvatar } from '@/components/MemberAvatar'
import {
  refetchingChatAtom,
  refetchingInboxAtom,
  useNavigationTabAction
} from '@/components/NavigationBar/useNavigationTabAction'
import { OrganizationSwitcher } from '@/components/NavigationSidebar/OrganizationSwitcher'
import { ProfileDropdown } from '@/components/NavigationSidebar/ProfileDropdown'
import { NotesTrailingAccessory } from '@/components/NotesIndex'
import { NoteTrailingAccessory } from '@/components/NoteView'
import { InvitePeopleButton } from '@/components/People/InvitePeopleButton'
import { PostOverflowMenu } from '@/components/Post/PostOverflowMenu'
import { PostsIndexDisplayDropdown } from '@/components/PostsIndex/PostsIndexDisplayDropdown'
import { BreadcrumbProjectCallButton } from '@/components/Projects/ProjectCallButton'
import { ProjectFavoriteButton } from '@/components/Projects/ProjectFavoriteButton'
import { ProjectOverflowMenu } from '@/components/Projects/ProjectOverflowMenu'
import { ProjectSidebarMobileToggleButton } from '@/components/Projects/ProjectSidebar/ProjectSidebarToggleButton'
import { useGoBack } from '@/components/Providers/HistoryProvider'
import { SearchField } from '@/components/SearchIndex'
import { addRecentSearchAtom } from '@/components/SearchIndex/RecentSearches'
import { ChatThreadOverflowMenu } from '@/components/Thread/ChatThreadOverflowMenu'
import { BreadcrumbCallButton } from '@/components/ThreadView/ThreadViewTitlebar'
import { useScope } from '@/contexts/scope'
import { useChatSubscriptions } from '@/hooks/useChatSubscriptions'
import { useGetCall } from '@/hooks/useGetCall'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetFavorites } from '@/hooks/useGetFavorites'
import { useGetNotifications } from '@/hooks/useGetNotifications'
import { useGetOrganizationMember } from '@/hooks/useGetOrganizationMember'
import { useGetOrganizationMemberships } from '@/hooks/useGetOrganizationMemberships'
import { useGetPost } from '@/hooks/useGetPost'
import { useGetProject } from '@/hooks/useGetProject'
import { useGetProjectMemberships } from '@/hooks/useGetProjectMemberships'
import { useGetThread } from '@/hooks/useGetThread'
import { useGetThreads } from '@/hooks/useGetThreads'
import { useGetUnreadNotificationsCount } from '@/hooks/useGetUnreadNotificationsCount'
import { useIsChatProjectRoute } from '@/hooks/useIsChatProjectRoute'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { useIsOrganizationMember } from '@/hooks/useIsOrganizationMember'
import { useLiveOrganizationUpdates } from '@/hooks/useLiveOrganizationUpdates'
import { useProjectSubscriptions } from '@/hooks/useProjectSubscriptions'
import { useSearchMixed } from '@/hooks/useSearchMixed'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { signinUrl } from '@/utils/queryClient'

import { CreateChatThreadDialog } from '../Chat/CreateChatThreadDialog'
import { MemberStatus } from '../MemberStatus'
import { StatusPicker } from '../StatusPicker'

const CreateProjectDialog = dynamic(
  () => import('@/components/Projects/Create/CreateProjectDialog').then((mod) => mod.CreateProjectDialog),
  {
    ssr: false
  }
)

export function NavigationBar() {
  const isDesktop = useIsDesktopApp()
  const wrapperClasses = cn(
    '  lg:hidden min-h-[--navbar-height] z-10 drag border-b transition-shadow flex-none bg-primary'
  )

  return (
    <>
      <m.nav onDoubleClick={() => isDesktop && nativeWindow.maximize()} className={wrapperClasses}>
        <div
          className={cn('mx-auto grid h-[--navbar-height] max-w-7xl grid-cols-5 items-center', {
            'pl-24 2xl:px-3': isDesktop && isMacOs,
            'px-3': !isDesktop || !isMacOs
          })}
        >
          <div className='flex items-center justify-start gap-2 pr-3'>
            <LeadingAccessory />
          </div>

          {/* Mobile center titlebar component */}
          <CenterAccessory />

          <div className='flex items-center justify-end pl-3'>
            <TrailingAccessory />
          </div>
        </div>
      </m.nav>
    </>
  )
}

export function SignedOutNavigationBar() {
  const { asPath } = useRouter()
  const isDesktop = useIsDesktopApp()
  const router = useRouter()
  const { data: post } = useGetPost({ postId: router.query?.postId as string })

  const accessory = router.query?.postId ? (
    <Link href={`/${post?.organization.slug}`} className='flex items-center justify-start gap-2'>
      <Avatar urls={post?.organization.avatar_urls} name={post?.organization.name} />
      <UIText weight='font-semibold'>{post?.organization.name}</UIText>
    </Link>
  ) : (
    <Link href={SITE_URL} className='flex items-center justify-start'>
      <Logo />
    </Link>
  )

  return (
    <nav
      onDoubleClick={() => isDesktop && nativeWindow.maximize()}
      className='drag bg-primary sticky inset-x-0 top-0 z-10 min-h-[--navbar-height] border-b transition-shadow'
    >
      <div className='mx-auto grid h-14 grid-cols-3 items-center gap-4 px-3'>
        {accessory}
        <div className='col-span-1' />
        <div className='flex flex-none items-center justify-end'>
          <Button href={signinUrl({ from: asPath })} variant='brand'>
            Try Campsite
          </Button>
        </div>
      </div>
    </nav>
  )
}

function TrailingAccessory() {
  const router = useRouter()
  const { scope } = useScope()
  const isInbox = router.pathname === '/[org]/inbox/[inboxView]'
  const isPosts = router.pathname === '/[org]/posts'
  const isPost = router.pathname === '/[org]/posts/[postId]'
  const isVersions = router.pathname === '/[org]/posts/[postId]/versions'
  const isProject =
    router.pathname === '/[org]/projects/[projectId]' || router.pathname === '/[org]/projects/[projectId]/docs'
  const isProjects = router.pathname === '/[org]/projects' || router.pathname === '/[org]/projects/archived'
  const isPeople = router.pathname === '/[org]/people'
  const isChatThread = router.pathname === '/[org]/chat/[threadId]'
  const isChat = router.pathname === '/[org]/chat'
  const isNewChat = router.pathname === '/[org]/chat/new'
  const isCalls = router.pathname === '/[org]/calls'
  const isCall = router.pathname === '/[org]/calls/[callId]'
  const isNotes = router.pathname === '/[org]/notes' || router.pathname === '/[org]/notes/organization'
  const isNote = router.pathname === '/[org]/notes/[noteId]'
  const isSearch = router.pathname === '/[org]/search'
  const isDrafts = router.pathname === '/[org]/drafts'

  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [chatDialogOpen, setChatDialogOpen] = useState(false)

  const { data: currentUser } = useGetCurrentUser()

  function onProjectCreated(project: Project) {
    setProjectDialogOpen(false)
    router.push(`/${scope}/projects/${project.id}`)
  }

  if (isCalls) return null
  if (isSearch) return null
  if (isVersions) return null
  if (isNewChat) return null
  if (isDrafts) return null
  if (isPosts) return <PostsTrailingAccessory />
  if (isNotes) return <NotesTrailingAccessory />

  if (isNote) return <NoteTrailingAccessory noteId={router.query?.noteId as string} />

  if (isCall) return <CallTrailingAccessory />

  if (isInbox) return <InboxTrailingAccessory inboxView={router.query.inboxView as InboxView} />

  if (isPost) return <PostTrailingAccessory />

  if (isProjects) {
    return (
      <>
        <CreateProjectDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} onCreate={onProjectCreated} />
        <Button variant='plain' onClick={() => setProjectDialogOpen(true)}>
          New
        </Button>
      </>
    )
  }

  if (isPeople) {
    return <InvitePeopleButton variant='plain' />
  }

  if (isProject) return <ProjectTrailingAccessory />

  if (isChat) {
    return (
      <>
        <CreateChatThreadDialog open={chatDialogOpen} onOpenChange={setChatDialogOpen} />
        <Button
          variant='plain'
          iconOnly={<PlusIcon size={24} />}
          onClick={() => setChatDialogOpen(true)}
          accessibilityLabel='New chat'
        />
      </>
    )
  }

  if (isChatThread) return <ChatThreadTrailingAccessory />

  return (
    <div className='flex items-center gap-2'>
      <StatusPicker />
      <ProfileDropdown
        align='end'
        side='bottom'
        trigger={
          <Button
            round
            variant='plain'
            accessibilityLabel='Profile and settings'
            iconOnly={currentUser && <MemberAvatar displayStatus member={{ user: currentUser }} size='sm' />}
          />
        }
      />
    </div>
  )
}

const PostsTrailingAccessory = () => <PostsIndexDisplayDropdown iconOnly />

function ProjectTrailingAccessory() {
  const router = useRouter()
  const { projectId } = router.query
  const { data: project } = useGetProject({ id: projectId as string })

  if (!project) return null

  return (
    <div className='flex items-center gap-0.5'>
      <BreadcrumbProjectCallButton project={project} />
      <ProjectOverflowMenu type='dropdown' project={project} />
      <ProjectSidebarMobileToggleButton />
    </div>
  )
}

function PostTrailingAccessory() {
  const router = useRouter()
  const { postId } = router.query
  const { data: post } = useGetPost({ postId: postId as string })

  if (!post) return null

  return <PostOverflowMenu type='dropdown' post={post} />
}

function PostLeadingAccessory() {
  const router = useRouter()
  const { postId, projectId, username, threadId, noteId, callId } = router.query
  const goBack = useGoBack()
  const { data: currentOrganization } = useGetCurrentOrganization()
  const { data: memberships } = useGetOrganizationMemberships()

  const isNewChat = router.pathname === '/[org]/chat/new'
  const isPosts = router.pathname === '/[org]/posts'
  const isDocs = router.pathname === '/[org]/notes'
  const isCalls = router.pathname === '/[org]/calls'
  const isSearch = router.pathname === '/[org]/search'
  const isDrafts = router.pathname === '/[org]/drafts'

  const showBackButton =
    !!postId ||
    !!projectId ||
    !!username ||
    !!threadId ||
    isNewChat ||
    !!noteId ||
    !!callId ||
    isDocs ||
    isCalls ||
    isPosts ||
    isSearch ||
    isDrafts

  let fallbackPath = `/${currentOrganization?.slug}`

  if (projectId) fallbackPath = `/${currentOrganization?.slug}/projects`
  if (threadId || isNewChat) fallbackPath = `/${currentOrganization?.slug}/chat`
  if (noteId) fallbackPath = `/${currentOrganization?.slug}/notes`

  return (
    <div className='relative flex h-10 w-10 items-center justify-start'>
      <m.div
        className={cn('absolute', {
          'pointer-events-none': showBackButton
        })}
        initial={{
          opacity: showBackButton ? 0 : 1,
          translateX: showBackButton ? -16 : 0
        }}
        animate={{
          opacity: showBackButton ? 0 : 1,
          translateX: showBackButton ? -16 : 0
        }}
      >
        <span>
          <OrganizationSwitcher
            trigger={
              <div className='text-quaternary hover:text-tertiary flex items-center gap-0.5'>
                <Avatar
                  rounded='rounded-md'
                  urls={currentOrganization?.avatar_urls}
                  name={currentOrganization?.name}
                  size='base'
                />
                {memberships && memberships.length > 1 && <ChevronSelectIcon className={cn({ hidden: isMobile })} />}
              </div>
            }
          />
        </span>
      </m.div>
      <m.div
        className={cn('absolute', {
          'pointer-events-none': !showBackButton
        })}
        initial={{
          opacity: showBackButton ? 1 : 0,
          translateX: showBackButton ? 0 : 16
        }}
        animate={{
          opacity: showBackButton ? 1 : 0,
          translateX: showBackButton ? 0 : 16
        }}
      >
        <span>
          <Button
            onClick={() => goBack({ fallbackPath })}
            variant='plain'
            iconOnly={<ArrowLeftIcon strokeWidth='2' />}
            accessibilityLabel='Back'
          />
        </span>
      </m.div>
    </div>
  )
}
function InboxTrailingAccessory({ inboxView }: { inboxView: string }) {
  const getNotifications = useGetNotifications({
    enabled: inboxView === 'updates',
    filter: 'home'
  })
  const notifications = useMemo(() => flattenInfiniteData(getNotifications.data), [getNotifications.data])

  if (inboxView !== 'updates') return null

  return <InboxFilterButtons notifications={notifications} />
}

function LeadingAccessory() {
  const router = useRouter()
  const { scope } = useScope()
  const isSearch = router.pathname === '/[org]/search'

  if (isSearch) return <BackButton fallbackPath={`/${scope}/home`} />

  return <PostLeadingAccessory />
}

function CenterAccessoryContainer({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={cn('col-span-3 flex items-center justify-center text-center', className)}>{children}</div>
}

function CenterAccessory() {
  const router = useRouter()
  const isInbox = router.pathname === '/[org]/inbox/[inboxView]'
  const isProfile = router.pathname === '/[org]/people/[username]'
  const isPosts = router.pathname === '/[org]/posts'
  const isPost = router.pathname === '/[org]/posts/[postId]'
  const isProject =
    router.pathname === '/[org]/projects/[projectId]' || router.pathname === '/[org]/projects/[projectId]/docs'
  const isProjects = router.pathname === '/[org]/projects' || router.pathname === '/[org]/projects/archived'
  const isPeople = router.pathname === '/[org]/people'
  const isSearch = router.pathname === '/[org]/search'
  const isTags = router.pathname === '/[org]/tags'
  const isVersionHistory = router.pathname === '/[org]/posts/[postId]/versions'
  const isChatThread = router.pathname === '/[org]/chat/[threadId]'
  const isChat = router.pathname === '/[org]/chat'
  const isNewChat = router.pathname === '/[org]/chat/new'
  const isCalls = router.pathname === '/[org]/calls'
  const isCall = router.pathname === '/[org]/calls/[callId]'
  const isNotes = router.pathname === '/[org]/notes' || router.pathname === '/[org]/notes/organization'
  const isNote = router.pathname === '/[org]/notes/[noteId]'
  const isHome = router.pathname === '/[org]/home'
  const isDrafts = router.pathname === '/[org]/drafts'

  const { data: project } = useGetProject({ id: router.query.projectId as string })
  const { data: post } = useGetPost({ postId: router.query.postId as string })

  if (isPosts) {
    return (
      <CenterAccessoryContainer>
        <UIText size='text-base' weight='font-semibold'>
          Posts
        </UIText>
      </CenterAccessoryContainer>
    )
  }

  if (isCalls) {
    return (
      <CenterAccessoryContainer>
        <UIText size='text-base' weight='font-semibold'>
          Calls
        </UIText>
      </CenterAccessoryContainer>
    )
  }

  if (isNotes) {
    return (
      <CenterAccessoryContainer>
        <UIText size='text-base' weight='font-semibold'>
          Docs
        </UIText>
      </CenterAccessoryContainer>
    )
  }

  if (isChat) {
    return (
      <CenterAccessoryContainer>
        <UIText size='text-base' weight='font-semibold'>
          Chat
        </UIText>
      </CenterAccessoryContainer>
    )
  }

  if (isNote) {
    return <CenterAccessoryContainer />
  }

  if (isCall) {
    return <CenterAccessoryContainer />
  }

  if (isNewChat) {
    if (router.query.username) {
      return <NewChatToCenterAccessory username={router.query.username as string} />
    } else {
      return (
        <CenterAccessoryContainer>
          <UIText size='text-base' weight='font-semibold'>
            New chat
          </UIText>
        </CenterAccessoryContainer>
      )
    }
  }

  if (isChatThread) {
    return (
      <CenterAccessoryContainer>
        <ChatThreadCenterAccessory />
      </CenterAccessoryContainer>
    )
  }

  if (isHome) {
    return <HomeCenterItem />
  }

  if (isProject && project) {
    return (
      <CenterAccessoryContainer>
        <div className='flex items-center gap-3'>
          {project.accessory && (
            <div className='flex items-center justify-center font-["emoji"] text-base'>{project.accessory}</div>
          )}

          <UIText size='text-base' weight='font-semibold' className='line-clamp-1'>
            {project.name}
          </UIText>

          {project.archived && (
            <UIText tertiary size='text-base' className='line-clamp-1'>
              (Archived)
            </UIText>
          )}

          {project.private && <LockIcon className='text-tertiary' />}

          <ProjectFavoriteButton project={project} />
        </div>
      </CenterAccessoryContainer>
    )
  }

  if (isInbox) {
    return (
      <CenterAccessoryContainer>
        <UIText size='text-base' weight='font-semibold'>
          Inbox
        </UIText>
      </CenterAccessoryContainer>
    )
  }

  if (isProjects) {
    return (
      <CenterAccessoryContainer>
        <UIText size='text-base' weight='font-semibold'>
          Channels
        </UIText>
      </CenterAccessoryContainer>
    )
  }

  if (isTags) {
    return (
      <CenterAccessoryContainer>
        <UIText size='text-base' weight='font-semibold'>
          Tags
        </UIText>
      </CenterAccessoryContainer>
    )
  }

  if (isPeople) {
    return (
      <CenterAccessoryContainer>
        <UIText size='text-base' weight='font-semibold'>
          People
        </UIText>
      </CenterAccessoryContainer>
    )
  }

  if (isSearch) {
    return (
      <CenterAccessoryContainer className='col-span-3'>
        <SearchIndexAccessory />
      </CenterAccessoryContainer>
    )
  }

  if (isVersionHistory) {
    return (
      <CenterAccessoryContainer>
        <UIText size='text-base' weight='font-semibold'>
          Version history
        </UIText>
      </CenterAccessoryContainer>
    )
  }

  if (isPost) {
    if (!post) return <CenterAccessoryContainer />

    return (
      <CenterAccessoryContainer>
        <div className='flex items-center gap-2'>
          <UIText size='text-base' weight='font-semibold'>
            Post
          </UIText>
        </div>
      </CenterAccessoryContainer>
    )
  }

  if (isProfile) {
    return (
      <CenterAccessoryContainer>
        <UIText size='text-base' weight='font-semibold'>
          Profile
        </UIText>
      </CenterAccessoryContainer>
    )
  }

  if (isDrafts) {
    return (
      <CenterAccessoryContainer>
        <UIText size='text-base' weight='font-semibold'>
          Drafts
        </UIText>
      </CenterAccessoryContainer>
    )
  }

  return <CenterAccessoryContainer />
}

function HomeCenterItem() {
  const { data: currentOrganization } = useGetCurrentOrganization()

  return (
    <CenterAccessoryContainer>
      <UIText size='text-base' weight='font-semibold'>
        {currentOrganization?.name}
      </UIText>
    </CenterAccessoryContainer>
  )
}

function NewChatToCenterAccessory({ username }: { username: string }) {
  const { data: organizationMember } = useGetOrganizationMember({ username })

  return (
    <CenterAccessoryContainer>
      <span className='flex items-center gap-1.5'>
        <UIText size='text-base' weight='font-semibold line-clamp-1'>
          {organizationMember?.user.display_name || 'New chat'}
        </UIText>
        <MemberStatus status={organizationMember?.status} />
      </span>
    </CenterAccessoryContainer>
  )
}

function SearchIndexAccessory() {
  const router = useRouter()
  const { scope } = useScope()
  const focus = (router.query.f as string | undefined) || ''
  const query = (router.query.q as string | undefined) || ''
  const { isFetching } = useSearchMixed({ query, focus })
  const addRecentSearch = useSetAtom(addRecentSearchAtom)

  useEffect(() => {
    addRecentSearch({ scope: `${scope}`, search: query })
  }, [addRecentSearch, query, scope])

  return <SearchField key={query} query={query} isLoading={isFetching} mobile />
}

function ChatThreadCenterAccessory() {
  const router = useRouter()
  const { threadId } = router.query
  const { data: thread } = useGetThread({ threadId: threadId as string })

  if (!threadId) return null
  if (!thread) return null

  const firstMember = thread.other_members.at(0)
  const isDm = thread.other_members.length === 1

  return (
    <div className='flex items-center justify-center gap-2'>
      {thread.other_members.length === 1 && !thread.group && firstMember && (
        <span className='mr-1'>
          <MemberAvatar displayStatus member={firstMember} size='sm' />
        </span>
      )}
      <UIText size='text-base' weight='font-semibold' className='line-clamp-1 text-left'>
        {thread.title}
      </UIText>
      {isDm && firstMember?.role === 'guest' && <GuestBadge />}
      {!thread.group && thread.other_members.length === 1 && <MemberStatus size='lg' status={firstMember?.status} />}
    </div>
  )
}

function ChatThreadTrailingAccessory() {
  const router = useRouter()
  const { threadId } = router.query
  const { data: thread } = useGetThread({ threadId: threadId as string })

  if (!threadId) return null
  if (!thread) return null

  return (
    <>
      <BreadcrumbCallButton thread={thread} />
      <ChatThreadOverflowMenu thread={thread} />
    </>
  )
}

function CallTrailingAccessory() {
  const router = useRouter()
  const { callId } = router.query
  const { data: call } = useGetCall({ id: callId as string })

  if (!callId) return null
  if (!call) return null

  return (
    <div className='flex items-center gap-0.5'>
      <CallSharePopover call={call}>
        <Button leftSlot={<PaperAirplaneIcon />} variant='plain' tooltip='Share call'>
          Share
        </Button>
      </CallSharePopover>
      <CallOverflowMenu call={call} type='dropdown' />
    </div>
  )
}

export function MobileTabBar() {
  const router = useRouter()
  const hasMounted = useHasMounted()
  const { data: currentUser } = useGetCurrentUser()

  const isPost = router.pathname === '/[org]/posts/[postId]'
  const isChatThread = router.pathname === '/[org]/chat/[threadId]'
  const isNewChat = router.pathname === '/[org]/chat/new'
  const isNote = router.pathname === '/[org]/notes/[noteId]'
  const isSearch = router.pathname === '/[org]/search'
  const { isChatProject } = useIsChatProjectRoute()

  const isOrgMember = useIsOrganizationMember()
  const { data: organization } = useGetCurrentOrganization({ enabled: isOrgMember })

  // these are global subscriptions for the entire app. do not disable!
  useChatSubscriptions()
  useProjectSubscriptions()
  useLiveOrganizationUpdates(organization)

  const isCommunity = useIsCommunity()

  if (!hasMounted) return null
  if (isChatThread) return null
  if (isNewChat) return null
  if (isPost) return null
  if (isNote) return null
  if (isSearch) return null
  if (isChatProject) return null
  if (!currentUser?.logged_in) return null

  return (
    <>
      <nav
        className={cn('drag bg-primary z-10 grid items-center gap-1.5 border-t p-1.5 lg:hidden', {
          'pb-safe-offset-1.5': isMobile,
          'pb-1.5': !isMobile,
          'grid-cols-2': isCommunity,
          'grid-cols-3': !isCommunity
        })}
      >
        <HomeTab />
        <InboxTab />
        {!isCommunity && <ChatTab />}
      </nav>
    </>
  )
}

function NavigationButton({
  children,
  href,
  onClick,
  isActive,
  onMouseEnter
}: {
  children: React.ReactNode
  href: string
  onClick?: () => void
  isActive?: boolean
  onMouseEnter?: () => void
}) {
  return (
    <Link
      onMouseEnter={onMouseEnter}
      draggable={false}
      className={cn('hover:bg-tertiary group flex flex-1 items-center justify-center rounded-md px-3 py-1.5', {
        'bg-tertiary text-primary': isActive,
        'text-tertiary bg-transparent': !isActive
      })}
      onClick={onClick}
      href={href}
    >
      {children}
    </Link>
  )
}

export const refetchingHomeAtom = atom(false)

function InboxTab() {
  const router = useRouter()
  const active = router.pathname === '/[org]/inbox/[inboxView]'
  const { scope } = useScope()
  const { refetch, isFetching } = useGetNotifications({ filter: 'home' })

  const handleRefetch = useNavigationTabAction({
    active,
    refetchAtom: refetchingInboxAtom,
    refetch,
    isFetching
  })

  return (
    <NavigationButton href={`/${scope}/inbox/${defaultInboxView}`} isActive={active} onClick={handleRefetch}>
      <BadgedNotificationsIcon />
    </NavigationButton>
  )
}

function HomeTab() {
  const router = useRouter()
  const active = router.pathname === '/[org]/home'
  const { scope } = useScope()
  const { refetch: refetchProjectMemberships, isFetching: isFetchingProjectMemberships } = useGetProjectMemberships()
  const { refetch: refetchFavorites, isFetching: isFetchingFavorites } = useGetFavorites()
  const { refetch: refetchChatThreads, isFetching: isRefetchingChatThreads } = useGetThreads()

  const handleRefetch = useNavigationTabAction({
    active,
    refetchAtom: refetchingHomeAtom,
    refetch: () => {
      refetchProjectMemberships()
      refetchFavorites()
      refetchChatThreads()
    },
    isFetching: isFetchingProjectMemberships || isFetchingFavorites || isRefetchingChatThreads
  })

  return (
    <NavigationButton href={`/${scope}/home`} isActive={active} onClick={handleRefetch}>
      <BadgedHomeIcon />
    </NavigationButton>
  )
}

function ChatTab() {
  const router = useRouter()
  const active = router.pathname === '/[org]/chat'
  const { scope } = useScope()
  const isCommunity = useIsCommunity()
  const { refetch, isFetching } = useGetThreads({ enabled: !isCommunity })

  const handleRefetch = useNavigationTabAction({
    active,
    refetchAtom: refetchingChatAtom,
    refetch,
    isFetching
  })

  return (
    <NavigationButton href={`/${scope}/chat`} isActive={active} onClick={handleRefetch}>
      <BadgedChatIcon prefetch={isMobile} />
    </NavigationButton>
  )
}

function BadgedChatIcon({ prefetch }: { prefetch?: boolean }) {
  const { scope } = useScope()
  const getUnreadNotificationsCount = useGetUnreadNotificationsCount()
  const unreadChats = getUnreadNotificationsCount.data?.messages[`${scope}`] || 0
  const hasUnreads = unreadChats > 0

  useGetThreads({ enabled: hasUnreads && prefetch })

  return (
    <div className='relative'>
      {hasUnreads && (
        <div className='pointer-events-none absolute -right-[3px] -top-px z-10 h-2 w-2 flex-none rounded-full bg-blue-500' />
      )}
      <ChatBubbleIcon size={28} />
    </div>
  )
}

function BadgedNotificationsIcon() {
  const { scope } = useScope()
  const getUnreadNotificationsCount = useGetUnreadNotificationsCount()
  const inboxCount = getUnreadNotificationsCount.data?.home_inbox[`${scope}`] || 0
  const hasUnreads = inboxCount > 0

  return (
    <div className='relative'>
      {hasUnreads && (
        <div className='pointer-events-none absolute -right-[3px] -top-px z-10 h-2 w-2 flex-none rounded-full bg-blue-500' />
      )}
      <InboxIcon size={28} />
    </div>
  )
}

function BadgedHomeIcon() {
  const { data: projectMemberships } = useGetProjectMemberships()
  const hasUnreadProjects = projectMemberships?.some((pm) => pm.project.unread_for_viewer)

  const hasUnreads = hasUnreadProjects

  return (
    <div className='relative'>
      {hasUnreads && (
        <div className='pointer-events-none absolute -right-[3px] -top-px z-10 h-2 w-2 flex-none rounded-full bg-blue-500' />
      )}
      <HomeIcon size={28} />
    </div>
  )
}
