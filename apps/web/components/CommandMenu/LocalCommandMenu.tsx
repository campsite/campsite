/* eslint-disable max-lines */
import { Dispatch, SetStateAction, useMemo, useRef, useState } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { useAtom, useSetAtom } from 'jotai'
import { Url } from 'next/dist/shared/lib/router/router'
import { useRouter } from 'next/router'
import { isMacOs } from 'react-device-detect'
import toast from 'react-hot-toast'

import {
  OrganizationMember,
  PublicOrganization,
  SyncMessageThread,
  SyncMessageThreads,
  SyncProject
} from '@campsite/types'
import {
  AccessIcon,
  Avatar,
  Badge,
  ChatBubbleIcon,
  ChatBubblePlusIcon,
  ChevronRightIcon,
  CirclePlusIcon,
  cn,
  CodeIcon,
  Command,
  desktopJoinCall,
  DismissibleLayer,
  GearIcon,
  HomeIcon,
  InboxIcon,
  LayeredHotkeys,
  LinkIcon,
  LockIcon,
  NoteIcon,
  NotePlusIcon,
  PostDraftIcon,
  PostPlusIcon,
  ProjectIcon,
  QuestionMarkCircleIcon,
  SearchIcon,
  UIText,
  useCopyToClipboard,
  useIsDesktopApp,
  UserCircleIcon,
  UserLinkIcon,
  VideoCameraBoltIcon,
  VideoCameraIcon
} from '@campsite/ui'
import { CommandRef, HighlightedCommandItem } from '@campsite/ui/Command'

import { commandMenuAtom } from '@/atoms/commandMenu'
import { CreateChatThreadDialog } from '@/components/Chat/CreateChatThreadDialog'
import { setFeedbackDialogOpenAtom } from '@/components/Feedback/FeedbackDialog'
import { GuestBadge } from '@/components/GuestBadge'
import { defaultInboxView } from '@/components/InboxItems/InboxSplitView'
import { MemberAvatar } from '@/components/MemberAvatar'
import { usePostComposer } from '@/components/PostComposer'
import { CreateProjectDialog } from '@/components/Projects/Create/CreateProjectDialog'
import { enableDevToolsAtom } from '@/components/StaffDevTools'
import { useScope } from '@/contexts/scope'
import { useCreateCallRoom } from '@/hooks/useCreateCallRoom'
import { useCreateNewNote } from '@/hooks/useCreateNote'
import { useCurrentUserIsStaff } from '@/hooks/useCurrentUserIsStaff'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetOrganizationMemberships } from '@/hooks/useGetOrganizationMemberships'
import { useGetPersonalCallRoom } from '@/hooks/useGetPersonalCallRoom'
import { useGetPersonalDraftPosts } from '@/hooks/useGetPersonalDraftPosts'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { useSyncedMessageThreads } from '@/hooks/useSyncedMessageThreads'
import { useSyncedProjects } from '@/hooks/useSyncedProjects'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

type NavigateFn = (destination: Url) => void

interface DialogState {
  'create-channel': boolean
  'create-chat': boolean
}

export function LocalCommandMenu() {
  const [open, setOpen] = useAtom(commandMenuAtom)
  const [query, setQuery] = useState('')
  const [dialogState, setDialogState] = useState<DialogState>({
    'create-channel': false,
    'create-chat': false
  })

  const router = useRouter()
  const isCommunity = useIsCommunity()
  const ref = useRef<CommandRef | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // hide inactive projects from default states
  const showInactive = query.length > 0
  const { data: memberships } = useGetOrganizationMemberships()
  const { projects } = useSyncedProjects({ enabled: open, includeArchived: showInactive })
  const { threads } = useSyncedMessageThreads({ enabled: open, excludeProjectChats: true })
  const setFeedbackDialogOpen = useSetAtom(setFeedbackDialogOpenAtom)

  const toggleMenu = () => {
    if (open) {
      setOpen(false)
      return
    }

    setOpen(true)
  }

  // using 'mod' with useHotKeys maps to ctrl AND cmd on macos which we do not want
  const modKey = isMacOs ? 'meta' : 'ctrl'
  const isOnboarding = router.pathname.startsWith('/[org]/onboard') || router.pathname.startsWith('/new')

  function close() {
    setOpen(false)

    setTimeout(() => setQuery(''), 300)
  }

  function navigate(destination: Url) {
    close()
    router.push(destination)
  }

  const isSearching = !!query.length

  return (
    <>
      <LayeredHotkeys
        keys={`${modKey}+k`}
        callback={toggleMenu}
        options={{ enableOnContentEditable: true, enableOnFormTags: true, enabled: !isOnboarding }}
      />

      <CreateProjectDialog
        open={dialogState['create-channel']}
        onOpenChange={(val) =>
          setDialogState({
            'create-channel': val,
            'create-chat': false
          })
        }
      />
      <CreateChatThreadDialog
        open={dialogState['create-chat']}
        onOpenChange={(val) =>
          setDialogState({
            'create-chat': val,
            'create-channel': false
          })
        }
      />
      <RadixDialog.Root open={open} onOpenChange={(open) => (open ? setOpen(true) : close())}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className='data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out fixed inset-0 bg-black/10 dark:bg-black/60' />
          <RadixDialog.Content
            className='data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out fixed left-1/2 top-16 w-full max-w-[calc(100%_-_16px)] origin-[50%] -translate-x-1/2 transition-all md:max-w-3xl'
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              inputRef.current?.focus()
            }}
            onKeyDownCapture={(evt) => {
              if (evt.key === 'Escape') {
                evt.stopPropagation()
                close()
              }
            }}
          >
            <DismissibleLayer>
              <Command
                className='command-menu bg-elevated shadow-popover flex max-h-[454px] flex-col rounded-lg border border-transparent dark:border-gray-800'
                ref={ref}
                minScore={0.1}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') {
                    ref.current?.bounce()
                  }

                  if (e.key === 'Backspace' && !query.length) {
                    ref.current?.bounce()
                    return
                  }
                }}
              >
                <Command.Input
                  ref={inputRef}
                  placeholder='Type a command or search...'
                  onValueChange={setQuery}
                  value={query}
                  className='w-full border-0 bg-transparent px-4 py-3 text-[15px] placeholder-gray-400 outline-none focus:border-black focus:border-black/5 focus:ring-0'
                />

                <Command.List className='scrollbar-hide scroll-pb-2 overflow-y-auto overflow-x-hidden px-2 pb-2 outline-none'>
                  <Home navigate={navigate} />

                  <Command.Group>
                    {isSearching && memberships && memberships.length > 1 && (
                      <Organizations organizations={memberships.map((m) => m.organization)} navigate={navigate} />
                    )}
                    {!isCommunity && isSearching && <Threads threads={threads} navigate={navigate} />}
                    {isSearching && <Projects projects={projects} navigate={navigate} />}
                  </Command.Group>

                  <Create close={close} setDialogState={setDialogState} />

                  <Item
                    value='Share feedback or report a bug'
                    keywords={['report', 'crash', 'bug', 'feedback']}
                    onSelect={() => {
                      close()
                      setTimeout(() => setFeedbackDialogOpen(true), 100)
                    }}
                  >
                    <QuestionMarkCircleIcon />
                    Share feedback or report a bug
                  </Item>

                  <SearchPageItem query={query} navigate={navigate} />

                  <StaffTools close={close} query={query} />
                </Command.List>
              </Command>
            </DismissibleLayer>
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    </>
  )
}

function Home({ navigate }: { navigate: NavigateFn }) {
  const { scope } = useScope()
  const { data: currentUser } = useGetCurrentUser()
  const isStaff = useCurrentUserIsStaff()
  const hasSidebarChat = useCurrentUserOrOrganizationHasFeature('sidebar_dms')
  const ffUrl =
    !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
      ? 'http://admin.campsite.test:3001/admin/features/'
      : 'https://admin.campsite.com/admin/features'
  const { data: organization } = useGetCurrentOrganization()

  return (
    <Command.Group heading='Jump to'>
      <Item onSelect={() => navigate(`/${scope}/inbox/${defaultInboxView}`)}>
        <InboxIcon />
        Inbox
      </Item>

      {hasSidebarChat && (
        <Item onSelect={() => navigate(`/${scope}/chat`)}>
          <ChatBubbleIcon />
          Messages
        </Item>
      )}

      <Item onSelect={() => navigate(`/${scope}/posts`)}>
        <HomeIcon />
        Home
      </Item>

      <Item onSelect={() => navigate(`/${scope}/notes`)}>
        <NoteIcon />
        Docs
      </Item>

      <Item onSelect={() => navigate(`/${scope}/calls`)}>
        <VideoCameraIcon />
        Calls
      </Item>

      <DraftPageItem navigate={navigate} />

      {organization?.viewer_can_see_projects_index && (
        <Item onSelect={() => navigate(`/${scope}/projects`)}>
          <ProjectIcon />
          Channels
        </Item>
      )}

      {organization?.viewer_can_see_people_index && (
        <Item onSelect={() => navigate(`/${scope}/people`)}>
          <UserCircleIcon />
          People
        </Item>
      )}

      {currentUser && (
        <Item
          value={`${currentUser.display_name}-${currentUser.username}-profile`}
          onSelect={() => navigate(`/${scope}/people/${currentUser.username}`)}
        >
          <Avatar urls={currentUser.avatar_urls} name={currentUser.display_name} size='xs' />
          {currentUser.display_name}
        </Item>
      )}

      {currentUser && (
        <Item
          value={`${currentUser.display_name}-${currentUser.username}-account-settings`}
          onSelect={() => navigate('/me/settings')}
        >
          <GearIcon />
          Account settings
        </Item>
      )}

      {isStaff && (
        <Item onSelect={() => window.open(ffUrl, '_blank')}>
          <AccessIcon />
          Feature flags
        </Item>
      )}
    </Command.Group>
  )
}

function Create({
  close,
  setDialogState
}: {
  close: () => void
  setDialogState: Dispatch<SetStateAction<DialogState>>
}) {
  const { mutate: createCallRoom } = useCreateCallRoom()
  const [copy] = useCopyToClipboard()
  const { showPostComposer } = usePostComposer()
  const { handleCreate } = useCreateNewNote()
  const { data: personalCallRoom } = useGetPersonalCallRoom()
  const isDesktop = useIsDesktopApp()
  const { data: organization } = useGetCurrentOrganization()

  function onInstantCall() {
    createCallRoom(
      { source: 'new_call_button' },
      {
        onSuccess: (data) => {
          setTimeout(() => {
            if (isDesktop) {
              desktopJoinCall(`${data?.url}?im=open`)
            } else {
              window.open(`${data?.url}?im=open`, '_blank')
            }
          })
          close()
        },
        onError: () => {
          toast('Unable to start a call, try again.')
        }
      }
    )
  }

  function onCallLink() {
    createCallRoom(
      { source: 'new_call_button' },
      {
        onSuccess: (data) => {
          copy(data.url)
          toast('Call link copied to clipboard.')
          close()
        },
        onError: () => {
          toast('Unable to create a link, try again.')
        }
      }
    )
  }

  function onJoinPersonalCall() {
    if (!personalCallRoom) return
    if (isDesktop) {
      desktopJoinCall(`${personalCallRoom.url}?im=open`)
    } else {
      window.open(`${personalCallRoom.url}?im=open`, '_blank')
    }
    close()
  }

  function onPersonalCallLink() {
    if (!personalCallRoom) return
    copy(personalCallRoom.url)
    toast('Personal call link copied to clipboard.')
    close()
  }

  function onCreateChannel() {
    setDialogState({
      'create-channel': true,
      'create-chat': false
    })
    close()
  }

  function onCreateChat() {
    setDialogState({
      'create-chat': true,
      'create-channel': false
    })
    close()
  }

  function onCreatePost() {
    showPostComposer()
    close()
  }

  function onCreateDoc() {
    handleCreate(undefined, () => {
      close()
    })
  }

  return (
    <Command.Group heading='Create'>
      <Item onSelect={onCreatePost}>
        <PostPlusIcon />
        New post
      </Item>
      <Item onSelect={onCreateDoc}>
        <NotePlusIcon />
        New doc
      </Item>
      <Item onSelect={onCreateChat}>
        <ChatBubblePlusIcon />
        New chat
      </Item>
      {organization?.viewer_can_see_new_project_button && (
        <Item onSelect={onCreateChannel}>
          <CirclePlusIcon />
          New channel
        </Item>
      )}
      <Item onSelect={onInstantCall}>
        <VideoCameraBoltIcon />
        Start an instant call
      </Item>
      <Item onSelect={onCallLink}>
        <LinkIcon />
        Create call link
      </Item>
      <Item onSelect={onJoinPersonalCall}>
        <VideoCameraBoltIcon />
        Join your personal call
      </Item>
      <Item onSelect={onPersonalCallLink}>
        <UserLinkIcon />
        Use your personal call link
      </Item>
    </Command.Group>
  )
}

function Projects({ navigate, projects }: { navigate: NavigateFn; projects: SyncProject[] }) {
  const { active, archived } = useMemo(() => {
    const active: SyncProject[] = []
    const archived: SyncProject[] = []

    for (const project of projects) {
      if (project.archived) {
        archived.push(project)
      } else {
        active.push(project)
      }
    }

    return { active, archived }
  }, [projects])

  if (!projects.length) return null

  return (
    <>
      {active.map((project) => (
        <ProjectItem key={project.id} navigate={navigate} project={project} />
      ))}
      {archived.map((project) => (
        <ProjectItem key={project.id} navigate={navigate} project={project} />
      ))}
    </>
  )
}

function Organizations({ navigate, organizations }: { navigate: NavigateFn; organizations: PublicOrganization[] }) {
  const { scope } = useScope()
  const filtered = organizations.filter((org) => org.slug !== scope)

  return (
    <>
      {filtered.map((organization) => (
        <OrganizationItem key={organization.id} navigate={navigate} organization={organization} />
      ))}
    </>
  )
}

function ProjectItem({ navigate, project }: { navigate: NavigateFn; project: SyncProject }) {
  const { scope } = useScope()

  function onSelect(id: string) {
    navigate(`/${scope}/projects/${id}`)
  }

  return (
    <Item
      value={`${project.name}-${project.id}`}
      onSelect={() => onSelect(project.id)}
      scoreModifier={project.archived ? 0.3 : 1}
    >
      {project.accessory ? (
        <span className='flex w-5 items-center justify-center font-["emoji"]'>{project.accessory}</span>
      ) : (
        <ProjectIcon />
      )}
      {project.name}
      {project.private && (
        <div className='text-quaternary h-5.5 w-5.5 flex items-center justify-center'>
          <LockIcon size={16} strokeWidth='2' />
        </div>
      )}
      {project.archived && (
        <UIText size='xs' tertiary>
          (Archived)
        </UIText>
      )}
    </Item>
  )
}

function OrganizationItem({ navigate, organization }: { navigate: NavigateFn; organization: PublicOrganization }) {
  function onSelect(slug: string) {
    navigate(`/${slug}/inbox/${defaultInboxView}`)
  }

  return (
    <Item value={`${organization.name}-${organization.id}`} onSelect={() => onSelect(organization.slug)}>
      <Avatar urls={organization.avatar_urls} name={organization.name} size='xs' rounded='rounded' />
      <div className='flex items-center gap-0'>
        <span>{organization.name}</span>
        <ChevronRightIcon className='text-quaternary opacity-70' />
        <span className='text-tertiary'>Switch organization</span>
      </div>
    </Item>
  )
}

interface SearchPageItemProps {
  query: string
  navigate: NavigateFn
}

function SearchPageItem({ query, navigate }: SearchPageItemProps) {
  const { scope } = useScope()

  if (!query) return null

  return (
    <Item
      scoreModifier={0.3}
      forceMount
      onSelect={() => navigate({ pathname: '/[org]/search', query: { org: scope, q: query } })}
    >
      <SearchIcon />
      <span className='text-secondary'>
        Search for <span className='font-semibold'>{query}</span>
      </span>
    </Item>
  )
}

function Threads({ navigate, threads }: { navigate: NavigateFn; threads: SyncMessageThreads }) {
  if (!threads.threads && !threads.new_thread_members) return null

  return (
    <>
      {threads.threads.map((thread) => (
        <ExistingThreadItem key={thread.id} thread={thread} navigate={navigate} />
      ))}
      {threads.new_thread_members.map((member) => (
        <NewThreadItem key={member.id} member={member} navigate={navigate} />
      ))}
    </>
  )
}

function ExistingThreadItem({ navigate, thread }: { navigate: NavigateFn; thread: SyncMessageThread }) {
  const { scope } = useScope()

  function onSelect(id: string) {
    navigate(`/${scope}/chat/${id}`)
  }

  return (
    <Item
      value={`${thread.title}-${thread.id}`}
      keywords={[thread.title]}
      scoreModifier={thread.dm_other_member?.deactivated ? 0.3 : 1}
      onSelect={() => onSelect(thread.id)}
    >
      {thread.dm_other_member ? (
        <MemberAvatar member={thread.dm_other_member} size='xs' />
      ) : thread.image_url ? (
        <Avatar urls={thread.avatar_urls} name={thread.title} size='xs' />
      ) : (
        <ChatBubbleIcon />
      )}
      {thread.title}
      {thread.dm_other_member?.role === 'guest' && <GuestBadge size='sm' />}
      {thread.dm_other_member?.deactivated && <Badge>Deactivated</Badge>}
    </Item>
  )
}

function NewThreadItem({ navigate, member }: { navigate: NavigateFn; member: OrganizationMember }) {
  const { scope } = useScope()

  function onSelect(username: string) {
    navigate(`/${scope}/chat/new?username=${username}`)
  }

  return (
    <Item
      value={`${member.user.display_name}-${member.user.id}`}
      keywords={[member.user.display_name]}
      scoreModifier={member.user.username ? 0.3 : 1}
      onSelect={() => onSelect(member.user.username)}
    >
      <Avatar name={member.user.display_name} urls={member.user.avatar_urls} size='xs' />
      {member.user.display_name}
      {member.role === 'guest' && <GuestBadge />}
      {member.deactivated && <Badge>Deactivated</Badge>}
    </Item>
  )
}

function StaffTools({ close, query }: { close: () => void; query: string }) {
  const isStaff = useCurrentUserIsStaff()
  const [enableDevTools, setEnableDevTools] = useAtom(enableDevToolsAtom)

  if (!isStaff || !query) return null

  return (
    <Command.Group heading='Tools'>
      <Item
        onSelect={() => {
          setEnableDevTools((prev) => !prev)
          close()
        }}
      >
        <CodeIcon />
        <span className='text-primary'>{enableDevTools ? 'Disable' : 'Enable'} Dev Tools</span>
      </Item>
    </Command.Group>
  )
}

function Item({ className, ...rest }: React.ComponentPropsWithoutRef<typeof HighlightedCommandItem>) {
  return <HighlightedCommandItem className={cn('h-10 gap-2', className)} {...rest} />
}

interface DraftPageItemProps {
  navigate: NavigateFn
}

function DraftPageItem({ navigate }: DraftPageItemProps) {
  const { scope } = useScope()
  const { data: draftPostsData } = useGetPersonalDraftPosts()
  const draftPosts = useMemo(() => flattenInfiniteData(draftPostsData) ?? [], [draftPostsData])

  if (draftPosts.length === 0) return null

  return (
    <Item onSelect={() => navigate(`/${scope}/drafts`)}>
      <PostDraftIcon />
      Drafts
    </Item>
  )
}
