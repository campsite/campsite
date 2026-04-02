import { useState } from 'react'
import { useRouter } from 'next/router'

import { OauthApplication, SyncOrganizationMember } from '@campsite/types'
import { Avatar, Button, Command, SearchIcon, UIText } from '@campsite/ui'
import { HighlightedCommandItem } from '@campsite/ui/Command'
import * as Dialog from '@campsite/ui/src/Dialog'

import { AppBadge } from '@/components/AppBadge'
import { GuestBadge } from '@/components/GuestBadge'
import { InvitePeopleButton } from '@/components/People/InvitePeopleButton'
import { useScope } from '@/contexts/scope'
import { useGetOauthApplications } from '@/hooks/useGetOauthApplications'
import { useSyncedMembers } from '@/hooks/useSyncedMembers'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateChatThreadDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='lg' align='top' disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>New chat</Dialog.Title>
      </Dialog.Header>

      {open && <DMStep onSelect={() => onOpenChange(false)} onCancel={() => onOpenChange(false)} />}
    </Dialog.Root>
  )
}

function DMStep({ onSelect, onCancel }: { onSelect: () => void; onCancel: () => void }) {
  const router = useRouter()
  const { scope } = useScope()
  const [query, setQuery] = useState('')
  const { members: allOrgMembers } = useSyncedMembers({ excludeCurrentUser: true })
  const { data: allOauthApplications } = useGetOauthApplications()
  const guests = allOrgMembers.filter((member) => member.role === 'guest')
  const nonGuests = allOrgMembers.filter((member) => member.role !== 'guest')
  const messageableApps = (allOauthApplications ?? []).filter((app) => app.direct_messageable)
  const isOnlyOrgMember = allOrgMembers.length === 0

  function onSelectMember(member: SyncOrganizationMember) {
    onSelect()
    router.push(`/${scope}/chat/new?username=${member.user.username}`)
  }

  function onSelectOauthApplication(app: OauthApplication) {
    onSelect()
    router.push(`/${scope}/chat/new?oauth_application_id=${app.id}`)
  }

  return (
    <>
      <Command className='bg-elevated flex min-h-[30dvh] flex-1 flex-col overflow-hidden p-0 px-2' loop>
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
