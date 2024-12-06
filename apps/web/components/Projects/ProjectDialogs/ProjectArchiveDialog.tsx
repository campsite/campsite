import { useCallback } from 'react'
import { useArchiveProject } from 'hooks/useArchiveProject'

import { Project } from '@campsite/types'
import { Button } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

interface ProjectArchiveDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectArchiveDialog({ project, open, onOpenChange }: ProjectArchiveDialogProps) {
  const archiveProjectMutation = useArchiveProject()

  const handleCleanup = useCallback(() => {
    onOpenChange(false)
  }, [project.id]) // eslint-disable-line

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='sm'>
      <Dialog.Header>
        <Dialog.Title>Archive channel</Dialog.Title>
        <Dialog.Description>
          New posts can not be added to archived channels, but all previous posts will still be visible. Archived
          channels can be unarchived at any time.
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={() =>
              archiveProjectMutation.mutate(project.id, {
                onSuccess: () => handleCleanup()
              })
            }
            disabled={archiveProjectMutation.isPending}
            autoFocus
          >
            Archive
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
