import { useState } from 'react'

import { MessageThread } from '@campsite/types'
import { Button, FormError, TextField } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { AvatarUploader } from '@/components/AvatarUploader'
import { useUpdateThread } from '@/hooks/useUpdateThread'
import { TransformedFile } from '@/utils/types'

interface Props {
  thread: MessageThread
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditGroupChatDialog({ thread, open, onOpenChange }: Props) {
  const [title, setTitle] = useState(thread.title)
  const [image, setImage] = useState<TransformedFile | null>(null)
  const [imageError, setImageError] = useState<Error | null>(null)
  const { mutate: updateThread, isPending } = useUpdateThread({ threadId: thread.id })
  const disabledSubmit = isPending || !!imageError || (image ? !image.key : false)

  function handleSave() {
    updateThread({ title, image_path: image?.key })
    onOpenChange(false)
  }

  function onFileUploadError(_file: TransformedFile, error: Error) {
    setImageError(error)
  }

  function onFileUploadStart(file: TransformedFile) {
    setImage(file)
    setImageError(null)
  }

  function onFileUploadSuccess(file: TransformedFile, key: string | null) {
    setImage({ ...file, key })
    setImageError(null)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} size='lg'>
      <Dialog.Header>
        <Dialog.Title>Edit chat</Dialog.Title>
      </Dialog.Header>

      <div className='flex flex-col items-center justify-center gap-4 p-8 pt-4'>
        <AvatarUploader
          resource='MessageThread'
          src={thread.image_url}
          onFileUploadError={onFileUploadError}
          onFileUploadStart={onFileUploadStart}
          onFileUploadSuccess={onFileUploadSuccess}
          shape='circle'
        />

        {imageError && <FormError>{imageError.message}</FormError>}

        <TextField
          maxLength={32}
          value={title}
          onChange={setTitle}
          placeholder='Chat title'
          onCommandEnter={handleSave}
        />
      </div>

      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant='primary' onClick={handleSave} disabled={disabledSubmit}>
            Save
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
