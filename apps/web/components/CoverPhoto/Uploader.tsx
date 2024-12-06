import { useCallback, useMemo, useState } from 'react'
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
}

export function CoverPhotoUploader({
  onFileUploadSuccess,
  onFileUploadError,
  onFileUploadStart,
  resource,
  src
}: Props) {
  const { scope } = useScope()
  const [file, setFile] = useState<TransformedFile | null>(null)
  const fileUploadMutation = useFileUploadMutation(onFileUploadSuccess, onFileUploadError, 'key')
  const previewableFileSrc = useMemo(
    () => (file ? window.URL.createObjectURL(file.raw) : src ? src : null),
    [file, src]
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const acceptedFile = acceptedFiles[0]

      if (!acceptedFile) {
        return toast.error('Cover photos must be a JPEG or PNG and be less than 5mb')
      }

      const transformedFile = await transformFile(acceptedFile)

      setFile(transformedFile)
      onFileUploadStart(transformedFile)

      fileUploadMutation.mutate({
        file: transformedFile,
        orgSlug: scope as string,
        resource
      })
    },
    [scope, fileUploadMutation, resource, onFileUploadStart]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5, // 5mb,
    useFsAccessApi: false,
    multiple: false,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png']
    }
  })

  return (
    <div className='relative flex w-full cursor-pointer'>
      <div {...getRootProps()} className='relative flex w-full cursor-pointer'>
        <input name='files rounded-full' {...getInputProps()} />
        {previewableFileSrc ? (
          <Image
            src={previewableFileSrc}
            width={1280}
            height={426}
            alt='Cover photo'
            className={cn(
              'mx-auto mt-0 aspect-[3/1] w-full place-content-start rounded-md border object-cover object-center',
              { 'opacity-50': fileUploadMutation.isPending }
            )}
          />
        ) : (
          <div
            className={cn(
              'text-tertiary hover:bg-tertiary flex aspect-[3/1] w-full cursor-pointer items-center justify-center rounded-md border border-dashed text-sm',
              {
                'border-blue-400 bg-blue-100 hover:border-blue-500': isDragActive,
                'bg-secondary hover:border-primary border-primary': !isDragActive
              }
            )}
          >
            <PicturePlusIcon />
          </div>
        )}

        {!src && (
          <div className='bg-elevated absolute -bottom-2 -right-2 flex translate-y-0 cursor-pointer items-center justify-center rounded-full border p-2 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg'>
            <PencilIcon />
          </div>
        )}
      </div>
    </div>
  )
}
