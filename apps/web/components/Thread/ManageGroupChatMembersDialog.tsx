import { useState } from 'react'

import { MessageThread, SyncOrganizationMember } from '@campsite/types'
import { Avatar, Button, Checkbox, Command, isMetaEnter, Link, SearchIcon, UIText } from '@campsite/ui'
import { HighlightedCommandItem } from '@campsite/ui/Command'
import * as Dialog from '@campsite/ui/src/Dialog'

import { GuestBadge } from '@/components/GuestBadge'
import { useScope } from '@/contexts/scope'
import { useExecuteOnChange } from '@/hooks/useExecuteOnChange'
import { useSyncedMembers } from '@/hooks/useSyncedMembers'
import { useUpdateThreadOtherMembers } from '@/hooks/useUpdateThreadOtherMembers'

interface Props {
  thread: MessageThread
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageGroupChatMembersDialog({ thread, open, onOpenChange }: Props) {
  const { scope } = useScope()
  const [query, setQuery] = useState('')
  const { members } = useSyncedMembers({ enabled: open, excludeCurrentUser: true, query })
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(thread.other_members.map((m) => m.id))
  const { mutate: updateThreadOtherMembers, isPending } = useUpdateThreadOtherMembers({ threadId: thread.id })

  function resetSelectedMemberIds() {
    setSelectedMemberIds(thread.other_members.map((m) => m.id))
  }

  function handleOpenChange(open: boolean) {
    onOpenChange(open)
    resetSelectedMemberIds()
    setQuery('')
  }

  useExecuteOnChange(thread.other_members, () => {
    resetSelectedMemberIds()
  })

  function onSelectMember(member: SyncOrganizationMember) {
    setSelectedMemberIds((prev) => {
      if (prev.some((id) => id === member.id)) {
        return prev.filter((id) => id !== member.id)
      } else {
        return [...prev, member.id]
      }
    })

    if (query.length > 0) {
      setQuery('')
    }
  }

  function handleSave() {
    updateThreadOtherMembers(selectedMemberIds, {
      onSuccess: () => {
        onOpenChange(false)
      }
    })
  }

  function onKeyDownCapture(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      e.currentTarget.blur()
    }

    if (isMetaEnter(e)) {
      e.preventDefault()
      handleSave()
    }
  }

  const membersHaveChanged =
    selectedMemberIds.length !== thread.other_members.length ||
    selectedMemberIds.some((id) => !thread.other_members.some((om) => om.id === id))

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} size='lg' align='top' disableDescribedBy>
      <Dialog.Header className='pb-0'>
        <Dialog.Title>Chat members</Dialog.Title>
      </Dialog.Header>

      <Command className='flex min-h-[30dvh] flex-1 flex-col overflow-hidden' loop>
        <div className='flex items-center gap-3 border-b px-3'>
          <div className='flex h-6 w-6 items-center justify-center'>
            <SearchIcon className='text-quaternary' />
          </div>
          <Command.Input
            autoFocus
            placeholder='Search people...'
            value={query}
            onValueChange={setQuery}
            className='w-full border-0 bg-transparent py-3 pl-0 pr-4 text-[15px] placeholder-gray-400 outline-none focus:border-black focus:border-black/5 focus:ring-0'
            onKeyDownCapture={onKeyDownCapture}
          />
        </div>

        <Command.List className='scrollbar-hide overflow-y-auto'>
          <Command.Group className='p-3'>
            <Command.Empty className='flex h-full w-full flex-1 flex-col items-center justify-center gap-1 p-8 pt-12'>
              <UIText weight='font-medium' quaternary>
                Nobody found
              </UIText>
              <Link href={`/${scope}/people`} className='text-blue-500 hover:underline'>
                <UIText inherit>Invite people</UIText>
              </Link>
            </Command.Empty>

            {members?.map((member) => (
              <HighlightedCommandItem
                key={`${member.user.display_name}-${member.user.username}`}
                onClick={() => onSelectMember(member)}
                onSelect={() => onSelectMember(member)}
                className='h-10 gap-3 rounded-lg'
              >
                <Avatar deactivated={member.deactivated} urls={member.user.avatar_urls} size='sm' />
                <div className='line-clamp-1 flex flex-1 items-center gap-3'>
                  {member.user.display_name}
                  {member.role === 'guest' && <GuestBadge />}
                </div>
                <Checkbox checked={selectedMemberIds.some((id) => id === member.id)} />
              </HighlightedCommandItem>
            ))}
          </Command.Group>
        </Command.List>
      </Command>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button
            variant='flat'
            onClick={() => {
              onOpenChange(false)
              resetSelectedMemberIds()
              setQuery('')
            }}
          >
            Cancel
          </Button>
          <Button variant='primary' onClick={handleSave} disabled={isPending || !membersHaveChanged}>
            Save
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
