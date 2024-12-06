import { useCallback, useState } from 'react'
import { useDeleteProject } from 'hooks/useDeleteProject'
import { useRouter } from 'next/router'

import { Project } from '@campsite/types'
import { Button, TextField, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useScope } from '@/contexts/scope'

interface ProjectDeleteDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectDeleteDialog({ project, open, onOpenChange }: ProjectDeleteDialogProps) {
  const router = useRouter()
  const { scope } = useScope()
  const deleteProjectMutation = useDeleteProject()
  const isViewingProject = !!router.query.projectId
  const [deleteMatch, setDeleteMatch] = useState('')

  const handleCleanup = useCallback(() => {
    onOpenChange(false)

    if (isViewingProject) {
      return router.push(`/${scope}/projects`)
    }
  }, [project.id]) // eslint-disable-line

  const preventDelete =
    project.posts_count > 0 && deleteMatch.trim().toLowerCase() !== project.name.trim().toLowerCase()
  const isDisabled = preventDelete || deleteProjectMutation.isPending

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='sm'>
      <Dialog.Header>
        <Dialog.Title>Delete channel</Dialog.Title>
        <Dialog.Description>
          {project.posts_count === 0
            ? 'Are you sure you want to delete this channel? This action cannot be undone.'
            : 'This channel has posts. If you delete the channel, the posts will be deleted as well. This action cannot be undone.'}
        </Dialog.Description>
      </Dialog.Header>

      {project.posts_count > 0 && (
        <Dialog.Content>
          <div className='flex flex-col items-start gap-3'>
            <UIText primary weight='font-medium'>
              Type the name of the channel below to confirm.
            </UIText>
            <div className='w-full'>
              <TextField onChange={setDeleteMatch} placeholder={project.name} />
            </div>
          </div>
        </Dialog.Content>
      )}

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={() =>
              deleteProjectMutation.mutate(project.id, {
                onSuccess: () => handleCleanup()
              })
            }
            disabled={isDisabled}
          >
            Delete
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
