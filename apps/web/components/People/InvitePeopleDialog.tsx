import { useSetAtom } from 'jotai'

import { UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { InvitationForm } from '@/components/OrgSettings/InvitationForm'
import { rootFilterAtom } from '@/components/People/PeopleIndex'

import { OrganizationInviteLinkField } from './OrganizationInviteLinkField'

export function InvitePeopleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const setRootFilter = useSetAtom(rootFilterAtom)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='lg' align='top' disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>Invite people</Dialog.Title>
        <Dialog.CloseButton />
      </Dialog.Header>

      <Dialog.Content className='-mt-4 p-4'>
        <InvitationForm
          onInvitationsSent={() => {
            setRootFilter('invited')
            onOpenChange(false)
          }}
        />
      </Dialog.Content>

      <div className='bg-tertiary dark:bg-secondary flex flex-col gap-1 rounded-b-lg p-4 pb-5'>
        <UIText weight='font-medium'>Invite with a link</UIText>
        <UIText tertiary className='mb-2'>
          Anyone with this link can join your organization. By default, they will have the Member role.
        </UIText>

        <OrganizationInviteLinkField />
      </div>
    </Dialog.Root>
  )
}
