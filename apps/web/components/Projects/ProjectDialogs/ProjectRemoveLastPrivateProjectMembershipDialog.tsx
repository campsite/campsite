import { useDeleteProject } from 'hooks/useDeleteProject'
import { useRouter } from 'next/router'

import { Project } from '@campsite/types'
import { Button } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useScope } from '@/contexts/scope'
import { useArchiveProject } from '@/hooks/useArchiveProject'

interface ProjectRemoveLastPrivateProjectMembershipDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectRemoveLastPrivateProjectMembershipDialog({
  project,
  open,
  onOpenChange
}: ProjectRemoveLastPrivateProjectMembershipDialogProps) {
  const router = useRouter()
  const { scope } = useScope()
  const deleteProjectMutation = useDeleteProject()
  const archiveProjectMutation = useArchiveProject()
  const isViewingProject = !!router.query.projectId

  const handleCleanup = () => {
    onOpenChange(false)
    if (isViewingProject && !!project.archived) {
      return router.push(`/${scope}/projects`)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='sm'>
      <Dialog.Header>
        <Dialog.Title>You are the only member of this channel</Dialog.Title>
        <Dialog.Description>
          Private channels must have at least one member. You can {!project.archived && 'archive this channel or'}{' '}
          delete it permanently.
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.LeadingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </Dialog.LeadingActions>
        <Dialog.TrailingActions>
          <Button
            variant='flat'
            className='hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white'
            onClick={() =>
              deleteProjectMutation.mutate(project.id, {
                onSuccess: handleCleanup
              })
            }
          >
            Leave & Delete
          </Button>
          {!project.archived && (
            <Button
              variant='primary'
              onClick={() =>
                archiveProjectMutation.mutate(project.id, {
                  onSuccess: handleCleanup
                })
              }
            >
              Archive
            </Button>
          )}
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
