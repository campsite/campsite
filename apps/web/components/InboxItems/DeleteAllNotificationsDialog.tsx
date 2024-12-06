import { PublicOrganization } from '@campsite/types'
import { Button } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useDeleteAllNotifications } from '@/hooks/useDeleteAllNotifications'

interface Props {
  mode: 'all' | 'read' | 'closed'
  onClose: () => void
  organization?: PublicOrganization
  homeOnly?: boolean
}

export function DeleteAllNotificationsDialog({ mode, onClose, organization, homeOnly }: Props) {
  const deleteAll = useDeleteAllNotifications({ organization })
  const action = mode === 'all' ? 'all of your' : 'your read'

  return (
    <Dialog.Root open={mode !== 'closed'} onOpenChange={(open) => open && onClose()} size='sm'>
      <Dialog.Header>
        <Dialog.Title>Archive notifications</Dialog.Title>
        <Dialog.Description>
          {organization
            ? `Are you sure you want to archive ${action} notifications in the ${organization.name} organization?`
            : `Are you sure you want to archive ${action} notifications?`}
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onClose()}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={() =>
              deleteAll.mutate(
                { home_only: homeOnly, read_only: mode === 'read' },
                {
                  onSuccess: onClose
                }
              )
            }
            disabled={deleteAll.isPending}
            autoFocus
          >
            Archive
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
