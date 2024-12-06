import { useCallback, useMemo, useState } from 'react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

import { Button, MutationError, PicturePlusIcon, TextField } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'
import { cn } from '@campsite/ui/src/utils'

import { useScope } from '@/contexts/scope'
import { useCreateCustomReaction } from '@/hooks/useCreateCustomReaction'
import { useFileUploadMutation } from '@/hooks/useUploadFile'
import { formatTagName } from '@/utils/formatTagName'
import { transformFile } from '@/utils/transformFile'
import { TransformedFile } from '@/utils/types'

const PLACEHOLDER = 'party-blob'

interface CreateCustomReactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCustomReactionDialog({ open, onOpenChange }: CreateCustomReactionDialogProps) {
  const createCustomReaction = useCreateCustomReaction()
  const [name, setName] = useState('')
  const [isNameFocused, setIsNameFocused] = useState(false)
  const [file, setFile] = useState<TransformedFile | null>(null)
  const [fileError, setFileError] = useState<Error | null>(null)

  const disabledSubmit = !name || createCustomReaction.isPending || !!fileError || !file?.key

  const handleNameChange = useCallback((value: string) => {
    setName(formatTagName(value))
  }, [])
  const handleNameFocus = useCallback(() => {
    setIsNameFocused(true)
  }, [setIsNameFocused])
  const handleNameBlur = useCallback(() => {
    setIsNameFocused(false)
  }, [setIsNameFocused])

  const handleFileUploadStart = useCallback(
    (file: TransformedFile) => {
      setFile(file)
      setFileError(null)
      setName((prev) => {
        if (prev) return prev
        return file.name?.split('.')?.[0] ?? prev
      })
    },
    [setFile, setFileError, setName]
  )
  const handleFileUploadSuccess = useCallback(
    (file: TransformedFile, key: string | null) => {
      setFile({ ...file, key })
      setFileError(null)
    },
    [setFile, setFileError]
  )
  const handleFileUploadError = useCallback(
    (_file: TransformedFile, error: Error) => {
      setFileError(error)
    },
    [setFileError]
  )

  const handleOpenChange = useCallback(
    (open: boolean) => {
      onOpenChange(open)
      if (!open) {
        setName('')
        setFile(null)
        setFileError(null)
      }
    },
    [onOpenChange]
  )

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (disabledSubmit) return

    createCustomReaction.mutate(
      {
        name,
        file_path: file.key ?? '',
        file_type: file.type ?? ''
      },
      {
        onSuccess: () => handleOpenChange(false)
      }
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} size='sm' disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>Create custom emoji</Dialog.Title>
      </Dialog.Header>

      <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
        <Dialog.Content className='pt-0.5'>
          <div className='flex w-full items-start gap-2.5'>
            <CustomReactionUploader
              onFileUploadStart={handleFileUploadStart}
              onFileUploadSuccess={handleFileUploadSuccess}
              onFileUploadError={handleFileUploadError}
            />
            <div className='relative isolate flex-1'>
              <TextField
                type='text'
                value={name}
                onChange={handleNameChange}
                onCommandEnter={handleSubmit}
                onFocus={handleNameFocus}
                onBlur={handleNameBlur}
                placeholder={!isNameFocused ? PLACEHOLDER : ''}
                maxLength={32}
                minLength={2}
                autoComplete='off'
                additionalClasses='pl-[10.5px] w-full'
              />
              <div
                aria-hidden
                className='text-tertiary pointer-events-none absolute inset-0 left-[7px] top-[6.5px] z-10 text-sm'
              >
                :<span className='invisible font-normal'>{!isNameFocused && !name ? PLACEHOLDER : name}</span>
                <span className='inline-block w-[1.5px]' />:
              </div>
            </div>
          </div>

          {createCustomReaction.isError && (
            <div className='flex flex-col text-sm text-red-500'>
              <MutationError mutation={createCustomReaction} />
            </div>
          )}
        </Dialog.Content>

        <Dialog.Footer>
          <Dialog.TrailingActions>
            <Button variant='flat' onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type='submit'
              variant='primary'
              onClick={handleSubmit}
              loading={createCustomReaction.isPending}
              disabled={disabledSubmit}
            >
              {createCustomReaction.isPending ? 'Creating...' : 'Create'}
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </form>
    </Dialog.Root>
  )
}

interface CustomReactionUploaderProps {
  onFileUploadStart: (file: TransformedFile) => void
  onFileUploadSuccess: (file: TransformedFile, key: string | null) => void
  onFileUploadError: (file: TransformedFile, error: Error) => void
}

function CustomReactionUploader({
  onFileUploadStart,
  onFileUploadSuccess,
  onFileUploadError
}: CustomReactionUploaderProps) {
  const { scope } = useScope()
  const [file, setFile] = useState<TransformedFile | null>(null)
  const { mutate: fileUploadMutation, isPending } = useFileUploadMutation(onFileUploadSuccess, onFileUploadError, 'key')
  const previewableAvatar = useMemo(() => (file ? window.URL.createObjectURL(file.raw) : null), [file])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const acceptedFile = acceptedFiles[0]

      if (!acceptedFile) {
        return toast.error('Custom emojis must be a JPEG, PNG or GIF and be less than 5mb')
      }

      const transformedFile = await transformFile(acceptedFile)

      setFile(transformedFile)
      onFileUploadStart(transformedFile)

      fileUploadMutation({
        file: transformedFile,
        orgSlug: `${scope}`,
        resource: 'Organization'
      })
    },
    [scope, fileUploadMutation, onFileUploadStart]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5, // 5mb,
    useFsAccessApi: false,
    multiple: false,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif']
    }
  })

  return (
    <div className='relative inline-flex rounded-md' {...getRootProps()}>
      <input name='files' {...getInputProps()} />

      {previewableAvatar ? (
        <div
          className={cn(
            'inline-flex h-8 w-8 min-w-[32px] flex-none cursor-pointer items-center justify-center overflow-hidden rounded-md border-gray-200 object-cover ring-1 ring-gray-200 dark:ring-gray-700',
            {
              'opacity-50': isPending
            }
          )}
        >
          <Image src={previewableAvatar} width={20} height={20} alt='Custom emoji' />
        </div>
      ) : (
        <div
          className={cn(
            'text-tertiary flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-dashed text-sm',
            {
              'border-blue-400 bg-blue-100 hover:border-blue-400': isDragActive,
              'bg-tertiary hover:bg-quaternary border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600':
                !isDragActive
            }
          )}
        >
          <PicturePlusIcon size={16} strokeWidth='2.5' />
        </div>
      )}
    </div>
  )
}
