/* eslint-disable max-lines */
import { useCallback, useMemo, useState } from 'react'
import { atom, useAtom } from 'jotai'
import pluralize from 'pluralize'
import { OnChangeValue } from 'react-select'

import { COMMUNITY_SLUG } from '@campsite/config'
import { Project, SyncCustomReaction, SyncOrganizationMember } from '@campsite/types'
import {
  Button,
  ChatBubbleFilledIcon,
  LockIcon,
  MinusIcon,
  PlusIcon,
  PostFilledIcon,
  ProjectIcon,
  RadioGroup,
  RadioGroupItem,
  Switch,
  TextField,
  UIText
} from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import {
  OrganizationMemberMultiSelect,
  OrganizationMemberMultiSelectOptionType,
  organizationMemberToMultiSelectOption
} from '@/components/OrganizationMember/OrganizationMemberMultiSelect'
import { ReactionPicker } from '@/components/Reactions/ReactionPicker'
import { ViewerUpsellDialog } from '@/components/Upsell/ViewerUpsellDialog'
import { useCreateProject } from '@/hooks/useCreateProject'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useSyncedMembers } from '@/hooks/useSyncedMembers'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'
import { isStandardReaction, StandardReaction } from '@/utils/reactions'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate?: (project: Project) => void
}

type Step = 'name' | 'invite'
type Format = 'chat' | 'posts'

const stepAtom = atom<Step>('name')
const nameAtom = atom<string>('')
const formatAtom = atom<Format>('posts')
const descriptionAtom = atom<string | undefined>(undefined)
const accessoryAtom = atom<string | undefined>(undefined)
const privateAtom = atom<boolean>(false)
const inviteAllAtom = atom<boolean>(true)
const defaultAtom = atom<boolean>(false)
const membersAtom = atom<SyncOrganizationMember[]>([])

const projectComposerAtom = atom(
  (get) => ({
    step: get(stepAtom),
    name: get(nameAtom),
    description: get(descriptionAtom),
    format: get(formatAtom),
    accessory: get(accessoryAtom),
    private: get(privateAtom),
    inviteAll: get(inviteAllAtom),
    isDefault: get(defaultAtom),
    members: get(membersAtom),
    memberUserIds: get(membersAtom).map((member) => member.user.id)
  }),
  (_get, set, action: Action) => {
    switch (action.type) {
      case 'set-step':
        set(stepAtom, action.payload)
        break
      case 'set-name':
        set(nameAtom, action.payload)
        break
      case 'set-description':
        set(descriptionAtom, action.payload)
        break
      case 'set-format':
        set(formatAtom, action.payload)
        break
      case 'set-accessory':
        set(accessoryAtom, action.payload)
        break
      case 'set-private':
        set(privateAtom, action.payload)
        set(inviteAllAtom, !action.payload)
        break
      case 'set-invite-all':
        set(inviteAllAtom, action.payload)
        break
      case 'set-default':
        set(defaultAtom, action.payload)
        break
      case 'set-members':
        set(membersAtom, action.payload)
        break
      case 'reset':
        set(stepAtom, 'name')
        set(nameAtom, '')
        set(descriptionAtom, undefined)
        set(accessoryAtom, undefined)
        set(privateAtom, false)
        set(inviteAllAtom, true)
        set(defaultAtom, false)
        set(membersAtom, [])
        break
      default:
        break
    }
  }
)

type Action =
  | { type: 'set-step'; payload: Step }
  | { type: 'set-name'; payload: string }
  | { type: 'set-description'; payload: string }
  | { type: 'set-format'; payload: Format }
  | { type: 'set-accessory'; payload: string }
  | { type: 'set-private'; payload: boolean }
  | { type: 'set-invite-all'; payload: boolean }
  | { type: 'set-default'; payload: boolean }
  | { type: 'set-members'; payload: SyncOrganizationMember[] }
  | { type: 'reset' }

export function CreateProjectDialog({ open, onOpenChange, onCreate }: Props) {
  const [state, dispatch] = useAtom(projectComposerAtom)
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)
  const { data: currentOrganization } = useGetCurrentOrganization()
  const title = state.step === 'name' ? 'New channel' : state.private ? 'Invite people' : 'Add people'

  // prefetch synced members so that the invite step is ready
  useSyncedMembers({ enabled: open })

  function handleOpenChange(value: boolean) {
    // warn before losing draft content
    if (!!state.name && !value) return setShowDiscardWarning(true)

    // reset if closing
    if (!value) dispatch({ type: 'reset' })

    onOpenChange(value)
  }

  function handleCancelWarning() {
    setShowDiscardWarning(false)
  }

  function handleDiscardDraft() {
    dispatch({ type: 'reset' })
    setShowDiscardWarning(false)
    onOpenChange(false)
  }

  if (!currentOrganization?.viewer_can_create_project) {
    return (
      <ViewerUpsellDialog
        open={open}
        onOpenChange={onOpenChange}
        icon={<ProjectIcon size={28} />}
        title='Channel creation is available to members'
      />
    )
  }

  const dialogDescription =
    state.step === 'name'
      ? 'Channels keep your team’s posts organized. Use them to group conversations by project, team, or topic. '
      : state.name

  return (
    <>
      <Dialog.Root
        open={showDiscardWarning}
        size='sm'
        // force user to click cancel or discard
        onOpenChange={() => undefined}
        disableDescribedBy
      >
        <Dialog.Header>
          <Dialog.Title>Discard your draft channel?</Dialog.Title>
        </Dialog.Header>

        <Dialog.Footer>
          <Dialog.TrailingActions>
            <Button variant='flat' onClick={handleCancelWarning}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDiscardDraft}>
              Discard draft
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </Dialog.Root>

      <Dialog.Root open={open} onOpenChange={handleOpenChange} size='base'>
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{dialogDescription}</Dialog.Description>
        </Dialog.Header>

        <Dialog.Content className='overflow-visible'>
          {state.step === 'name' && <NameStep />}
          {state.step === 'invite' && <InviteStep />}
        </Dialog.Content>

        <Dialog.Footer>
          {state.step === 'name' && <NameActions onCancel={() => handleOpenChange(false)} />}
          {state.step === 'invite' && <InviteActions onCreate={onCreate} />}
        </Dialog.Footer>
      </Dialog.Root>
    </>
  )
}

function FormatOption({
  icon,
  title,
  description,
  active,
  onChange
}: {
  icon: React.ReactNode
  title: string
  description: string
  active: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label
      htmlFor={`format-${title}`}
      className='dark:bg-quaternary flex cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-3 text-center focus-within:ring-2 focus-within:ring-blue-100 has-[:checked]:border-blue-500 dark:focus-within:ring-blue-600/40'
    >
      <input
        type='radio'
        checked={active}
        onChange={(e) => onChange(e.target.checked)}
        className='sr-only'
        name='format'
        id={`format-${title}`}
      />

      {icon}
      <div>
        <UIText weight='font-medium'>{title}</UIText>
        <UIText secondary size='text-xs'>
          {description}
        </UIText>
      </div>
    </label>
  )
}

function NameStep() {
  const [state, dispatch] = useAtom(projectComposerAtom)
  const { data: currentOrganization } = useGetCurrentOrganization()
  const isCommunity = currentOrganization?.slug === COMMUNITY_SLUG
  const hasChatChannels = useCurrentUserOrOrganizationHasFeature('chat_channels')

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        dispatch({ type: 'set-step', payload: 'invite' })
      }
    },
    [dispatch]
  )

  const handleReactionSelect = useCallback(
    (reaction: StandardReaction | SyncCustomReaction) => {
      if (!isStandardReaction(reaction)) return

      dispatch({ type: 'set-accessory', payload: reaction.native })
    },
    [dispatch]
  )

  return (
    <div className='flex flex-col gap-4 pt-2.5'>
      <div className='flex w-full items-start gap-2.5'>
        <div className='group/accessory relative'>
          {state.accessory && (
            <button
              onClick={() => dispatch({ type: 'set-accessory', payload: '' })}
              className='text-primary bg-elevated absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full opacity-0 shadow ring-1 ring-gray-200 hover:bg-red-500 hover:text-white hover:ring-red-500 group-hover/accessory:opacity-100 dark:bg-gray-600 dark:ring-gray-700 dark:hover:bg-red-500'
            >
              <MinusIcon size={16} strokeWidth='2.5' />
            </button>
          )}

          {!state.accessory && (
            <span className='text-primary pointer-events-none absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-200 group-hover/accessory:bg-blue-500 group-hover/accessory:text-white group-hover/accessory:ring-blue-500 dark:bg-gray-600 dark:ring-gray-700'>
              <PlusIcon size={13} strokeWidth='2.5' />
            </span>
          )}
          <ReactionPicker
            trigger={
              <div className='dark:bg-quaternary hover:bg-quaternary text-secondary hover:text-primary hover:border-primary group flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md border p-1 text-xs font-medium'>
                {state.accessory ? (
                  <UIText className='font-["emoji"]' size='text-base'>
                    {state.accessory}
                  </UIText>
                ) : state.private ? (
                  <LockIcon />
                ) : (
                  <ProjectIcon />
                )}
              </div>
            }
            onReactionSelect={handleReactionSelect}
          />
        </div>
        <div className='flex flex-1 flex-col gap-2'>
          <div className='flex-1'>
            <TextField
              type='text'
              minLength={2}
              maxLength={32}
              autoFocus={!state.name}
              value={state.name}
              placeholder='Channel name'
              onChange={(payload) => dispatch({ type: 'set-name', payload })}
              onKeyDownCapture={handleKeyDown}
            />
          </div>
          {typeof state.description === 'undefined' && (
            <button
              onClick={() => dispatch({ type: 'set-description', payload: '' })}
              className='text-tertiary hover:text-primary px-2 text-left'
            >
              <UIText inherit size='text-xs'>
                + Add description (optional)
              </UIText>
            </button>
          )}
          {typeof state.description !== 'undefined' && (
            <div className='flex-1'>
              <TextField
                type='text'
                autoFocus={!!state.name && !state.description}
                multiline
                minRows={2}
                maxRows={2}
                maxLength={280}
                value={state.description}
                placeholder='Add description (optional)'
                onChange={(payload) => dispatch({ type: 'set-description', payload })}
                onKeyDownCapture={handleKeyDown}
              />
            </div>
          )}
          {hasChatChannels && (
            <div>
              <div className='grid grid-cols-2 gap-2 pt-2'>
                <FormatOption
                  icon={<PostFilledIcon className='text-secondary' size={24} />}
                  title='Posts'
                  description='Topic-based discussions'
                  active={state.format === 'posts'}
                  onChange={() => dispatch({ type: 'set-format', payload: 'posts' })}
                />
                <FormatOption
                  icon={<ChatBubbleFilledIcon className='text-secondary' size={24} />}
                  title='Chat'
                  description='Real-time conversations'
                  active={state.format === 'chat'}
                  onChange={() => dispatch({ type: 'set-format', payload: 'chat' })}
                />
              </div>
            </div>
          )}
          {!isCommunity && (
            <div className='flex items-center gap-1 pt-2'>
              <RadioGroup
                loop
                aria-label='Channel visibility'
                value={state.private ? 'private' : 'public'}
                className='flex flex-col gap-3'
                orientation='vertical'
                onValueChange={(value) => {
                  dispatch({ type: 'set-private', payload: value === 'private' })
                }}
              >
                <RadioGroupItem id='public' value='public'>
                  <UIText secondary>
                    Public — visible to anyone at{' '}
                    <span className='text-primary font-semibold'>{currentOrganization?.name}</span>
                  </UIText>
                </RadioGroupItem>
                <RadioGroupItem id='private' value='private'>
                  <UIText secondary>Private — only visible to specific people</UIText>
                </RadioGroupItem>
              </RadioGroup>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InviteStep() {
  const [state, dispatch] = useAtom(projectComposerAtom)
  const { data: currentUser } = useGetCurrentUser()
  const { members: allOrgMembers } = useSyncedMembers()

  const options: OrganizationMemberMultiSelectOptionType[] = useMemo(() => {
    const addedMemberIds = new Set(state.members.map((member) => member.id))

    return allOrgMembers
      .filter((member) => member.user.id !== currentUser?.id)
      .filter((member) => !addedMemberIds.has(member.user.id))
      .map((member) => organizationMemberToMultiSelectOption(member))
  }, [allOrgMembers, state.members, currentUser?.id])

  function handleChange(newValue: OnChangeValue<OrganizationMemberMultiSelectOptionType, true>) {
    if (newValue === null) return

    dispatch({ type: 'set-members', payload: newValue.map((o) => o.member) })
  }

  const value = state.members.map((member) => organizationMemberToMultiSelectOption(member))

  return (
    <div className='flex flex-col gap-3'>
      <AllSpecificToggle />

      <div className='min-h-10'>
        {!state.inviteAll && (
          <OrganizationMemberMultiSelect
            autoFocus={state.members.length === 0 && state.private}
            openMenuOnFocus
            value={value}
            options={options}
            onChange={handleChange}
            className='bg-quaternary flex-1 rounded-md border'
            placeholder={state.private ? 'Invite people...' : 'Add people...'}
            loadingMessage={() => 'Searching people...'}
            noOptionsMessage={() => 'Nobody found'}
          />
        )}

        <DefaultProjectToggle />
      </div>
    </div>
  )
}

function AllSpecificToggle() {
  const [state, dispatch] = useAtom(projectComposerAtom)
  const { data: currentOrganization } = useGetCurrentOrganization()
  const { members } = useSyncedMembers()
  const allOrgMembers = members.filter((member) => member.role !== 'guest')
  const userIsOnlyOrgMember = allOrgMembers.length === 1
  const isCommunity = currentOrganization?.slug === COMMUNITY_SLUG

  if (state.private) return null
  if (userIsOnlyOrgMember) return null
  if (isCommunity) return null

  return (
    <RadioGroup
      loop
      aria-label='Default channel membership'
      defaultValue={state.inviteAll ? 'all' : 'specific'}
      className='flex flex-col gap-3'
      orientation='vertical'
      onValueChange={(value) => dispatch({ type: 'set-invite-all', payload: value === 'all' ? true : false })}
    >
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
      <RadioGroupItem id='specific' value='specific'>
        <UIText secondary>Add specific people</UIText>
      </RadioGroupItem>
    </RadioGroup>
  )
}

function DefaultProjectToggle() {
  const [state, dispatch] = useAtom(projectComposerAtom)
  const viewerIsAdmin = useViewerIsAdmin()

  if (state.private) return null
  if (!state.inviteAll) return null
  if (!viewerIsAdmin) return null

  return (
    <div className='bg-tertiary flex flex-col gap-1 rounded-lg p-3'>
      <div className='flex items-center justify-between'>
        <UIText weight='font-medium'>Default channel?</UIText>
        <Switch checked={state.isDefault} onChange={(value) => dispatch({ type: 'set-default', payload: value })} />
      </div>
      <UIText secondary>
        When people join your organization in the future, they will be automatically added to this channel.
      </UIText>
    </div>
  )
}

function NameActions({ onCancel }: { onCancel: () => void }) {
  const [state, dispatch] = useAtom(projectComposerAtom)
  const disabled = state.name.length < 2 || state.name.length > 32
  const { data: currentOrganization } = useGetCurrentOrganization()

  function handleNext() {
    // dont let people mass-add to channels in the design community
    if (currentOrganization?.slug === COMMUNITY_SLUG) {
      dispatch({ type: 'set-invite-all', payload: false })
    }

    dispatch({ type: 'set-step', payload: 'invite' })
  }

  return (
    <Dialog.TrailingActions>
      <Button variant='flat' onClick={onCancel}>
        Cancel
      </Button>
      <Button variant='primary' onClick={handleNext} disabled={disabled}>
        Next
      </Button>
    </Dialog.TrailingActions>
  )
}

function InviteActions({ onCreate }: { onCreate?: (project: Project) => void }) {
  const [state, dispatch] = useAtom(projectComposerAtom)
  const { members: allOrgMembers } = useSyncedMembers()
  const userIsOnlyOrgMember = allOrgMembers.length === 1

  const createProject = useCreateProject()

  async function handleSubmit(e: any) {
    e.preventDefault()

    /*
      Extra guards:
      * user must have checked `isDefault`
      * the channel can't be private
      * the user must be inviting everyone
      
      If the user is inviting specific people, the channel can't be default. 
    */
    const is_default = state.isDefault && !state.private && state.inviteAll

    createProject.mutate(
      {
        name: state.name,
        description: state.description,
        accessory: state.accessory,
        slack_channel_id: undefined,
        slack_channel_is_private: false,
        cover_photo_path: undefined,
        private: state.private,
        member_user_ids: state.inviteAll ? [] : state.memberUserIds,
        is_default,
        add_everyone: state.inviteAll,
        chat_format: state.format === 'chat'
      },
      {
        onSuccess: (project) => {
          onCreate?.(project)
          dispatch({ type: 'reset' })
        }
      }
    )
  }

  function getButtonVerb() {
    if (userIsOnlyOrgMember) return 'Create'
    if (state.inviteAll) return 'Create'
    if (state.members.length === 0) return 'Skip for now'
    return 'Add'
  }

  function getButtonVariant() {
    if (userIsOnlyOrgMember) return 'primary'
    if (state.inviteAll) return 'primary'
    if (state.members.length === 0) return 'flat'
    return 'primary'
  }

  return (
    <Dialog.TrailingActions>
      <Button variant='flat' onClick={() => dispatch({ type: 'set-step', payload: 'name' })}>
        Back
      </Button>
      <Button variant={getButtonVariant()} onClick={handleSubmit} loading={createProject.isPending}>
        {getButtonVerb()}
      </Button>
    </Dialog.TrailingActions>
  )
}
