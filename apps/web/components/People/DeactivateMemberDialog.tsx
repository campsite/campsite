import { OrganizationMember, SyncOrganizationMember } from '@campsite/types'
import { Button, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useScope } from '@/contexts/scope'
import { useDeactivateOrganizationMember } from '@/hooks/useDeactivateOrganizationMember'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'

interface Props {
  member: SyncOrganizationMember | OrganizationMember
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeactivateMemberDialog({ member, open, onOpenChange }: Props) {
  const { scope } = useScope()
  const getCurrentOrganization = useGetCurrentOrganization()
  const currentOrganization = getCurrentOrganization.data
  const deactivateMemberMutation = useDeactivateOrganizationMember(scope as string)

  async function handleOnRemove() {
    await deactivateMemberMutation.mutate(
      { id: member.id },
      {
        onSuccess() {
          onOpenChange(false)
        }
      }
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='sm' disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>Deactivate {member.user.display_name}</Dialog.Title>
      </Dialog.Header>

      <Dialog.Content>
        <div className='flex flex-col gap-3'>
          <UIText
            tertiary
          >{`Deactivating ${member.user.display_name} will keep their post history, but they will no longer have access to the ${currentOrganization?.name} organization.`}</UIText>
          <UIText tertiary>{`You can re-invite ${member.user.display_name} to your organization at any time.`}</UIText>
        </div>
      </Dialog.Content>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>

          <Button
            variant='destructive'
            onClick={handleOnRemove}
            disabled={deactivateMemberMutation.isPending}
            autoFocus
          >
            {deactivateMemberMutation.isPending ? 'Deactivating...' : 'Deactivate'}
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
