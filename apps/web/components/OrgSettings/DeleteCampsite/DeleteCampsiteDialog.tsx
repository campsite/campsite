import { useState } from 'react'

import { Button, TextField, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { useDeleteOrganization } from '@/hooks/useDeleteOrganization'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteCampsiteDialog({ open, onOpenChange }: Props) {
  const getCurrentOrganization = useGetCurrentOrganization()
  const currentOrganization = getCurrentOrganization.data
  const deleteCampsiteMutation = useDeleteOrganization()
  const [deleteMatch, setDeleteMatch] = useState('')

  const preventDelete = deleteMatch.trim().toLowerCase() !== currentOrganization?.name.trim().toLowerCase()
  const isDisabled = preventDelete || deleteCampsiteMutation.isPending

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Header>
        <Dialog.Title>Delete organization</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete this organization? This action cannot be undone.
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Content>
        <div className='flex flex-col gap-3'>
          <UIText tertiary>
            All posts will be permanently deleted. All people will be removed. This action can not be undone.
          </UIText>
          <UIText primary weight='font-medium'>
            Type the name of the organization below to confirm.
          </UIText>
          <div className='w-full'>
            <TextField onChange={setDeleteMatch} placeholder={currentOrganization?.name} />
          </div>
        </div>
      </Dialog.Content>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant='destructive' onClick={() => deleteCampsiteMutation.mutate()} disabled={isDisabled}>
            Delete forever
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
