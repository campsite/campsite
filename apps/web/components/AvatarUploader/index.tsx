import { useMemo, useState } from 'react'
import { useFileUploadMutation } from 'hooks/useUploadFile'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

import { PencilIcon, PicturePlusIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { useScope } from '@/contexts/scope'
import { transformFile } from '@/utils/transformFile'
import { PresignedResource, TransformedFile } from '@/utils/types'

interface Props {
  onFileUploadSuccess: (file: TransformedFile, key: string | null) => void
  onFileUploadError: (file: TransformedFile, error: Error) => void
  onFileUploadStart: (file: TransformedFile) => void
  src?: string | null
  resource: PresignedResource
  shape?: 'circle' | 'square'
  className?: string
  id?: string
  size?: 'sm' | 'base'
}

export function AvatarUploader({
  onFileUploadSuccess,
  onFileUploadError,
  onFileUploadStart,
  resource,
  src,
  shape,
  className,
  id,
  size = 'base'
}: Props) {
  const { scope } = useScope()
  const [file, setFile] = useState<TransformedFile | null>(null)
  const { mutate: fileUploadMutation, isPending } = useFileUploadMutation(onFileUploadSuccess, onFileUploadError, 'key')
  const previewableAvatar = useMemo(() => (file ? window.URL.createObjectURL(file.raw) : src ? src : null), [file, src])

  const onDrop = async (acceptedFiles: File[]) => {
    const acceptedFile = acceptedFiles[0]

    if (!acceptedFile) {
      return toast.error('Avatars must be a JPEG or PNG and be less than 5mb')
    }

    const transformedFile = await transformFile(acceptedFile)

    setFile(transformedFile)
    onFileUploadStart(transformedFile)

    fileUploadMutation({
      file: transformedFile,
      orgSlug: scope as string,
      resource
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5, // 5mb,
    useFsAccessApi: false,
    multiple: false,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  })

  shape = shape ?? (resource === 'User' ? 'circle' : 'square')
  const { containerClasses, imgClasses } =
    size === 'sm'
      ? { containerClasses: 'w-24 h-24', imgClasses: 'min-w-[96px]' }
      : { containerClasses: 'w-32 h-32', imgClasses: 'min-w-[128px]' }
  const roundedClassName = shape === 'square' ? 'rounded-xl' : 'rounded-full'

  return (
    <div className={cn('inset-image-border relative flex', className, roundedClassName)} {...getRootProps()}>
      <input id={id} name='files' {...getInputProps()} />
      {previewableAvatar ? (
        <Image
          src={previewableAvatar}
          width={128}
          height={128}
          alt='Profile picture'
          className={cn(
            'inline-flex flex-none cursor-pointer object-cover',
            containerClasses,
            imgClasses,
            roundedClassName,
            {
              'opacity-50': isPending
            }
          )}
        />
      ) : (
        <div
          className={cn(
            'text-tertiary flex cursor-pointer items-center justify-center border border-dashed text-sm',
            containerClasses,
            roundedClassName,
            {
              'border-blue-400 bg-blue-100 hover:border-blue-400': isDragActive,
              'bg-tertiary hover:bg-quaternary border-gray-200 hover:border-gray-300 dark:border-gray-700':
                !isDragActive
            }
          )}
        >
          <PicturePlusIcon />
        </div>
      )}

      <div
        className={cn(
          'bg-elevated text-tertiary hover:text-primary absolute flex translate-y-0 cursor-pointer items-center justify-center p-2 ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow dark:ring-white/10',
          {
            'bottom-1 right-1 rounded-lg': shape === 'square',
            'bottom-0 right-0 rounded-full': shape === 'circle'
          }
        )}
      >
        <PencilIcon />
      </div>
    </div>
  )
}
