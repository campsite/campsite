import { useAtomValue } from 'jotai'
import { useFormState } from 'react-hook-form'

import { Button } from '@campsite/ui/Button'
import { Dialog } from '@campsite/ui/Dialog'

import { getSaveDraftButtonId, postComposerStateAtom } from '@/components/PostComposer/utils'

interface PostComposerDiscardDialogProps {
  showDiscardDialog: boolean
  setShowDiscardDialog: (show: boolean) => void
  onDiscard: () => void
}

export function PostComposerDiscardDialog({
  showDiscardDialog,
  setShowDiscardDialog,
  onDiscard
}: PostComposerDiscardDialogProps) {
  const formState = useFormState()
  const postComposerState = useAtomValue(postComposerStateAtom)

  return (
    <Dialog.Root open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
      <Dialog.Header>
        <Dialog.Title>You have unsaved changes</Dialog.Title>
        <Dialog.Description>Would you like to save your changes?</Dialog.Description>
      </Dialog.Header>

      <Dialog.Footer>
        <Dialog.LeadingActions>
          <Button variant='destructive' disabled={formState.isSubmitting} onClick={() => onDiscard()}>
            Discard
          </Button>
        </Dialog.LeadingActions>
        <Dialog.TrailingActions>
          <Button variant='flat' disabled={formState.isSubmitting} onClick={() => setShowDiscardDialog(false)}>
            Cancel
          </Button>

          <Button
            autoFocus
            variant='primary'
            loading={formState.isSubmitting}
            onClick={() => {
              const id = getSaveDraftButtonId(postComposerState?.type)

              if (id) {
                document.getElementById(id)?.click()
              }
            }}
          >
            Save
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
