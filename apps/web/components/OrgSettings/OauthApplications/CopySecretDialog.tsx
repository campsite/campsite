import { Button } from '@campsite/ui/Button'
import { WarningTriangleIcon } from '@campsite/ui/Icons'
import * as Dialog from '@campsite/ui/src/Dialog'
import { UIText } from '@campsite/ui/Text'
import { TextField } from '@campsite/ui/TextField'

interface CopySecretDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  secret: string
  keyType: 'api_key' | 'client_secret'
}

export function CopySecretDialog({ open, onOpenChange, secret, keyType = 'client_secret' }: CopySecretDialogProps) {
  const title = keyType === 'api_key' ? 'Copy API key' : 'Copy client secret'
  const tokenType = keyType === 'api_key' ? 'API key' : 'secret'
  const fieldLabel = keyType === 'api_key' ? 'API key' : 'Client secret'

  return (
    <Dialog.Root size='base' align='center' open={open} onOpenChange={onOpenChange} disableDescribedBy>
      <Dialog.Header className='border-b'>
        <Dialog.Title className='flex items-center justify-start gap-2'>{title}</Dialog.Title>
      </Dialog.Header>
      <Dialog.Content className='space-y-3 pt-3'>
        <TextField label={fieldLabel} value={secret} readOnly clickToCopy />
        <div className='flex items-start justify-center gap-2 rounded-lg bg-amber-50 p-2.5 text-amber-900 dark:bg-amber-300/10 dark:text-amber-200'>
          <WarningTriangleIcon />
          <UIText size='text-sm' inherit>
            This {tokenType} will only be displayed once. Please copy and save it before closing this dialog.
          </UIText>
        </div>
      </Dialog.Content>
      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button onClick={() => onOpenChange(false)} variant='primary'>
            Close
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
