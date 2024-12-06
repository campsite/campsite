import { KeyboardEvent, useMemo, useState } from 'react'
import { atom, useAtom, useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import pluralize from 'pluralize'
import { OnChangeValue } from 'react-select'

import { MessageThread, OauthApplication, SyncOrganizationMember } from '@campsite/types'
import {
  Avatar,
  Button,
  ChevronRightIcon,
  Command,
  PlusIcon,
  RadioGroup,
  RadioGroupItem,
  SearchIcon,
  TextField,
  UIText
} from '@campsite/ui'
import { HighlightedCommandItem } from '@campsite/ui/Command'
import * as Dialog from '@campsite/ui/src/Dialog'
import { isMetaEnter } from '@campsite/ui/src/utils'

import { AppBadge } from '@/components/AppBadge'
import { GuestBadge } from '@/components/GuestBadge'
import {
  OrganizationMemberMultiSelect,
  OrganizationMemberMultiSelectOptionType,
  organizationMemberToMultiSelectOption
} from '@/components/OrganizationMember/OrganizationMemberMultiSelect'
import { InvitePeopleButton } from '@/components/People/InvitePeopleButton'
import { useScope } from '@/contexts/scope'
import { useCreateThread } from '@/hooks/useCreateThread'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetOauthApplications } from '@/hooks/useGetOauthApplications'
import { useSyncedMembers } from '@/hooks/useSyncedMembers'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate?: (thread: MessageThread) => void
}

type Step = 'dm' | 'group'
type Visibility = 'all' | 'specific' | 'personal'

const step = atom<Step>('dm')
const titleAtom = atom<string>('')
const visibilityAtom = atom<Visibility>('specific')
const membersAtom = atom<SyncOrganizationMember[]>([])

const createGroupChatAtom = atom(
  (get) => ({
    step: get(step),
    title: get(titleAtom),
    visibility: get(visibilityAtom),
    members: get(membersAtom),
    memberIds: get(membersAtom).map((member) => member.id)
  }),
  (_get, set, action: Action) => {
    switch (action.type) {
      case 'set-step':
        set(step, action.payload)
        break
      case 'set-title':
        set(titleAtom, action.payload)
        break
      case 'set-visibility':
        set(visibilityAtom, action.payload)
        break
      case 'set-members':
        set(membersAtom, action.payload)
        break
      case 'reset':
        set(step, 'dm')
        set(titleAtom, '')
        set(visibilityAtom, 'all')
        set(membersAtom, [])
        break
      default:
        break
    }
  }
)

type Action =
  | { type: 'set-step'; payload: Step }
  | { type: 'set-title'; payload: string }
  | { type: 'set-visibility'; payload: Visibility }
  | { type: 'set-members'; payload: SyncOrganizationMember[] }
  | { type: 'reset' }

export function CreateChatThreadDialog({ open, onOpenChange }: Props) {
  const router = useRouter()
  const { scope } = useScope()
  const [state, dispatch] = useAtom(createGroupChatAtom)
  const title = state.step === 'dm' ? 'New chat' : 'New group chat'

  function handleOpenChange(value: boolean) {
    if (!value) dispatch({ type: 'reset' })

    onOpenChange(value)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} size='lg' align='top' disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>{title}</Dialog.Title>
      </Dialog.Header>

      {open && state.step === 'dm' && (
        <DMStep onSelect={() => handleOpenChange(false)} onCancel={() => handleOpenChange(false)} />
      )}

      {open && state.step === 'group' && (
        <GroupStep
          onSuccess={(thread) => {
            handleOpenChange(false)

            router.push(`/${scope}/chat/${thread.id}`)
          }}
        />
      )}
    </Dialog.Root>
  )
}

function DMStep({ onSelect, onCancel }: { onSelect: () => void; onCancel: () => void }) {
  const router = useRouter()
  const { scope } = useScope()
  const [query, setQuery] = useState('')
  const dispatch = useSetAtom(createGroupChatAtom)
  const { members: allOrgMembers } = useSyncedMembers({ excludeCurrentUser: true })
  const { data: allOauthApplications } = useGetOauthApplications()
  const guests = allOrgMembers.filter((member) => member.role === 'guest')
  const nonGuests = allOrgMembers.filter((member) => member.role !== 'guest')
  const messageableApps = (allOauthApplications ?? []).filter((app) => app.direct_messageable)
  const isOnlyOrgMember = allOrgMembers.length === 0

  function onSelectMember(member: SyncOrganizationMember) {
    onSelect()
    dispatch({ type: 'reset' })

    router.push(`/${scope}/chat/new?username=${member.user.username}`)
  }
  function onSelectOauthApplication(app: OauthApplication) {
    onSelect()
    dispatch({ type: 'reset' })

    router.push(`/${scope}/chat/new?oauth_application_id=${app.id}`)
  }

  return (
    <>
      <Command className='bg-elevated flex min-h-[30dvh] flex-1 flex-col overflow-hidden p-0 px-2' loop>
        <button
          className='hover:bg-quaternary focus:bg-quaternary group mb-2 flex items-center gap-3 rounded-lg px-2 py-2 text-left focus-within:ring-0'
          onClick={() => dispatch({ type: 'set-step', payload: 'group' })}
        >
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-500 group-focus-within:bg-blue-500 group-focus-within:text-white group-hover:bg-blue-500 group-hover:text-white dark:bg-blue-900/50'>
            <PlusIcon size={16} />
          </div>
          <UIText
            className='group-hover:text-primary group-focus-within:text-primary flex-1 text-blue-600 dark:text-blue-400'
            inherit
          >
            New group
          </UIText>
          <ChevronRightIcon className='text-quaternary' />
        </button>

        <div className='-mx-2 h-px border-b' />

        {!isOnlyOrgMember && (
          <div className='-mx-2 flex items-center gap-3 border-b px-4'>
            <div className='flex h-6 w-6 items-center justify-center'>
              <SearchIcon className='text-quaternary' />
            </div>
            <Command.Input
              autoFocus
              placeholder='Search people...'
              value={query}
              onValueChange={setQuery}
              className='w-full border-0 bg-transparent py-3 pl-0 pr-4 text-[15px] placeholder-gray-400 outline-none focus:border-black focus:border-black/5 focus:ring-0'
              onKeyDownCapture={(e) => {
                e.stopPropagation()
                if (e.key === 'Escape') e.currentTarget.blur()
              }}
            />
          </div>
        )}

        <Command.List className='scrollbar-hide overflow-y-auto py-2'>
          <Command.Empty className='flex h-full w-full flex-1 flex-col items-center justify-center gap-2 p-8'>
            <UIText weight='font-medium' quaternary>
              {isOnlyOrgMember ? 'You are the only member of your organization.' : 'Nobody found'}
            </UIText>

            <InvitePeopleButton label='Invite your team' />
          </Command.Empty>

          {[...nonGuests, ...guests]?.map((member) => (
            <HighlightedCommandItem
              key={`${member.user.display_name}-${member.user.username}`}
              onClick={() => onSelectMember(member)}
              onSelect={() => onSelectMember(member)}
              className='h-10 gap-3 rounded-lg'
            >
              <Avatar deactivated={member.deactivated} urls={member.user.avatar_urls} size='sm' />
              <span className='line-clamp-1'>{member.user.display_name}</span>
              {member.role === 'guest' && <GuestBadge />}
            </HighlightedCommandItem>
          ))}
          {messageableApps.map((app) => (
            <HighlightedCommandItem
              key={app.id}
              onClick={() => onSelectOauthApplication(app)}
              onSelect={() => onSelectOauthApplication(app)}
              className='h-10 gap-3 rounded-lg'
            >
              <Avatar urls={app.avatar_urls} size='sm' rounded='rounded-md' />
              <span className='line-clamp-1'>{app.name}</span>
              <AppBadge />
            </HighlightedCommandItem>
          ))}
        </Command.List>
      </Command>
      <Dialog.Footer>
        <Dialog.LeadingActions>
          <Button variant='flat' onClick={onCancel}>
            Cancel
          </Button>
        </Dialog.LeadingActions>
      </Dialog.Footer>
    </>
  )
}

function GroupStep({ onSuccess }: { onSuccess: (thread: MessageThread) => void }) {
  const { data: currentOrganization } = useGetCurrentOrganization()
  const [state, dispatch] = useAtom(createGroupChatAtom)
  const { data: currentUser } = useGetCurrentUser()
  const { members } = useSyncedMembers()
  const isOnlyOrgMember = members.length === 1
  const allOrgMembers = members.filter((member) => member.role !== 'guest')

  const createThread = useCreateThread()

  const MEMBER_IDS = {
    all: allOrgMembers.map((member) => member.id),
    specific: state.memberIds,
    personal: []
  }

  async function handleSubmit(e: any) {
    e.preventDefault()

    createThread.mutate(
      {
        group: true,
        title: state.title,
        member_ids: MEMBER_IDS[state.visibility],
        attachments: []
      },

      {
        onSuccess
      }
    )
  }

  const options: OrganizationMemberMultiSelectOptionType[] = useMemo(() => {
    const addedMemberIds = new Set(state.members.map((member) => member.id))

    const guestsToBottom = (a: SyncOrganizationMember, b: SyncOrganizationMember) => {
      if (a.role === 'guest' && b.role !== 'guest') return 1
      if (a.role !== 'guest' && b.role === 'guest') return -1
      return 0
    }

    return members
      .filter((member) => member.user.id !== currentUser?.id)
      .filter((member) => !addedMemberIds.has(member.user.id))
      .sort(guestsToBottom)
      .map((member) => organizationMemberToMultiSelectOption(member))
  }, [members, state.members, currentUser?.id])

  function handleChange(newValue: OnChangeValue<OrganizationMemberMultiSelectOptionType, true>) {
    if (newValue === null) return

    dispatch({ type: 'set-members', payload: newValue.map((o) => o.member) })
  }

  const value = state.members.map((member) => organizationMemberToMultiSelectOption(member))

  function onKeyDownCapture(event: KeyboardEvent<HTMLInputElement>) {
    if (isMetaEnter(event)) {
      event.preventDefault()
      const hasTitle = !!state.title.length
      const hasSpecificMembers = state.visibility === 'specific' && !!state.members.length

      if (hasTitle && (state.visibility === 'all' || state.visibility === 'personal' || hasSpecificMembers)) {
        handleSubmit(event)
      }
    }
  }

  return (
    <>
      <Dialog.Content className='overflow-visible pt-1'>
        <div className='flex flex-col gap-5'>
          <TextField
            type='text'
            minLength={2}
            maxLength={32}
            autoFocus={!state.title}
            value={state.title}
            placeholder='Group name (optional)'
            onChange={(payload) => dispatch({ type: 'set-title', payload })}
            helpText='Name this group to make it easy for people to recognize.'
            onKeyDownCapture={onKeyDownCapture}
          />

          <div className='flex flex-col gap-3'>
            {isOnlyOrgMember && (
              <div className='bg-tertiary flex flex-col gap-2 rounded-lg p-3'>
                <UIText secondary>
                  You are the only member of{' '}
                  <span className='text-primary font-semibold'>{currentOrganization?.name}</span>. After you invite
                  people, you can add them to this group.
                </UIText>

                <InvitePeopleButton label='Invite your team' />
              </div>
            )}

            {!isOnlyOrgMember && (
              <RadioGroup
                loop
                aria-label='Default channel membership'
                defaultValue={state.visibility}
                className='flex flex-col gap-3'
                orientation='vertical'
                onValueChange={(payload: Visibility) => dispatch({ type: 'set-visibility', payload })}
              >
                <div className='flex flex-col gap-1.5'>
                  <RadioGroupItem id='specific' value='specific'>
                    <UIText secondary>Add specific people</UIText>
                  </RadioGroupItem>
                  {state.visibility === 'specific' && (
                    <div className='min-h-10 pl-8'>
                      <OrganizationMemberMultiSelect
                        openMenuOnFocus
                        value={value}
                        options={options}
                        onChange={handleChange}
                        className='bg-quaternary flex-1 rounded-md border'
                        placeholder='Add people...'
                        loadingMessage={() => 'Searching people...'}
                        noOptionsMessage={() => 'Nobody found'}
                      />
                    </div>
                  )}
                </div>
                <RadioGroupItem id='all' value='all'>
                  <UIText secondary>
                    Add {allOrgMembers.length > 1 && 'all'} {pluralize('member', allOrgMembers.length, true)} of{' '}
                    <span className='text-primary font-semibold'>{currentOrganization?.name}</span>
                  </UIText>
                  {members.some((member) => member.role === 'guest') && (
                    <UIText size='text-xs' tertiary>
                      Excludes guests
                    </UIText>
                  )}
                </RadioGroupItem>
                <RadioGroupItem id='personal' value='personal'>
                  <UIText secondary>Just for me</UIText>
                </RadioGroupItem>

                {state.visibility === 'personal' && (
                  <div className='-mt-3 pl-8'>
                    <UIText tertiary>You can add more people to this group chat later.</UIText>
                  </div>
                )}
              </RadioGroup>
            )}
          </div>
        </div>
      </Dialog.Content>

      <Dialog.Footer>
        <Dialog.LeadingActions>
          <Button variant='flat' onClick={() => dispatch({ type: 'set-step', payload: 'dm' })}>
            Back
          </Button>
        </Dialog.LeadingActions>
        <Dialog.TrailingActions>
          <Button
            disabled={state.visibility === 'specific' && !state.members.length}
            variant='primary'
            onClick={handleSubmit}
            loading={createThread.isPending}
          >
            Create
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </>
  )
}
