import { useRouter } from 'next/router'

import { Project, SyncUser } from '@campsite/types/generated'
import { Button, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useScope } from '@/contexts/scope'
import { useDeleteProjectMembership } from '@/hooks/useDeleteProjectMembership'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

interface RemoveProjectMembershipDialogProps {
  project: Project
  user: SyncUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectRemoveMembershipDialog({
  project,
  user,
  open,
  onOpenChange
}: RemoveProjectMembershipDialogProps) {
  const router = useRouter()
  const { scope } = useScope()
  const { data: currentUser } = useGetCurrentUser()
  const deleteProjectMembershipMutation = useDeleteProjectMembership(project.id)

  const handleDelete = () => {
    deleteProjectMembershipMutation.mutate(
      { user: user },
      {
        onSuccess: () => {
          if (currentUser?.id === user.id && project.private) router.push(`/${scope}/projects`)
          onOpenChange(false)
        }
      }
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Header>
        <Dialog.Title>
          {currentUser?.id === user.id ? 'Leave' : 'Remove from'} {project.private && 'private'} channel
        </Dialog.Title>
        <Dialog.Description>
          Are you sure you want to remove {currentUser?.id === user.id ? 'yourself' : user.display_name} from{' '}
          <UIText element='span' weight='font-bold'>
            {project.name}
          </UIText>
          ?{' '}
          {project.private &&
            (currentUser?.id === user.id
              ? "You won't be able to view this channel until another member invites you back."
              : "They won't be able to view this channel until another member invites them back.")}
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={deleteProjectMembershipMutation.isPending}
            autoFocus
          >
            {currentUser?.id === user.id ? 'Leave' : 'Remove'}
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
