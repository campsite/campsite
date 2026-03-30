import { KeyboardEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import pluralize from 'pluralize'
import { OnChangeValue } from 'react-select'

import { MessageThread, SyncOrganizationMember } from '@campsite/types'
import { Button, RadioGroup, RadioGroupItem, TextField, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'
import { isMetaEnter } from '@campsite/ui/src/utils'

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
import { useSyncedMembers } from '@/hooks/useSyncedMembers'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Visibility = 'all' | 'specific' | 'personal'

export function CreateGroupThreadDialog({ open, onOpenChange }: Props) {
  const router = useRouter()
  const { scope } = useScope()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='lg' align='top' disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>New group</Dialog.Title>
      </Dialog.Header>

      {open && (
        <GroupContent
          onSuccess={(thread) => {
            onOpenChange(false)
            router.push(`/${scope}/chat/${thread.id}`)
          }}
          onCancel={() => onOpenChange(false)}
        />
      )}
    </Dialog.Root>
  )
}

function GroupContent({ onSuccess, onCancel }: { onSuccess: (thread: MessageThread) => void; onCancel: () => void }) {
  const { data: currentOrganization } = useGetCurrentOrganization()
  const { data: currentUser } = useGetCurrentUser()
  const { members } = useSyncedMembers()
  const isOnlyOrgMember = members.length === 1
  const allOrgMembers = members.filter((member) => member.role !== 'guest')

  const createThread = useCreateThread()

  const [title, setTitle] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('specific')
  const [selectedMembers, setSelectedMembers] = useState<SyncOrganizationMember[]>([])
  const selectedMemberIds = selectedMembers.map((m) => m.id)

  const MEMBER_IDS = {
    all: allOrgMembers.map((member) => member.id),
    specific: selectedMemberIds,
    personal: []
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    createThread.mutate(
      { group: true, title, member_ids: MEMBER_IDS[visibility], attachments: [] },
      { onSuccess }
    )
  }

  const options: OrganizationMemberMultiSelectOptionType[] = useMemo(() => {
    const addedMemberIds = new Set(selectedMembers.map((member) => member.id))
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
  }, [members, selectedMembers, currentUser?.id])

  function handleChange(newValue: OnChangeValue<OrganizationMemberMultiSelectOptionType, true>) {
    if (newValue === null) return
    setSelectedMembers(newValue.map((o) => o.member))
  }

  const value = selectedMembers.map((member) => organizationMemberToMultiSelectOption(member))

  function onKeyDownCapture(event: KeyboardEvent<HTMLInputElement>) {
    if (isMetaEnter(event)) {
      event.preventDefault()
      const hasTitle = !!title.length
      const hasSpecificMembers = visibility === 'specific' && !!selectedMembers.length

      if (hasTitle && (visibility === 'all' || visibility === 'personal' || hasSpecificMembers)) {
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
            autoFocus={!title}
            value={title}
            placeholder='Group name (optional)'
            onChange={setTitle}
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
                defaultValue={visibility}
                className='flex flex-col gap-3'
                orientation='vertical'
                onValueChange={(payload: Visibility) => setVisibility(payload)}
              >
                <div className='flex flex-col gap-1.5'>
                  <RadioGroupItem id='specific' value='specific'>
                    <UIText secondary>Add specific people</UIText>
                  </RadioGroupItem>
                  {visibility === 'specific' && (
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
                {visibility === 'personal' && (
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
          <Button variant='flat' onClick={onCancel}>
            Cancel
          </Button>
        </Dialog.LeadingActions>
        <Dialog.TrailingActions>
          <Button
            disabled={visibility === 'specific' && !selectedMembers.length}
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
