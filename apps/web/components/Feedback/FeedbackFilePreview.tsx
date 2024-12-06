import { memo } from 'react'
import Image from 'next/image'

import { Button, LazyLoadingSpinner, ReorderDotsIcon, TrashIcon, VideoIcon } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { TransformedFile } from '@/utils/types'

import { ResizedFilePreview } from '../Composer/ResizedFilePreview'

interface Props {
  file: TransformedFile
  reorderable: boolean
  onRemove: () => void
}

export function FeedbackFilePreview(props: Props) {
  const { file, reorderable, onRemove } = props

  return (
    <>
      {reorderable && (
        <div className='text-tertiary flex items-center justify-center rounded-md p-1 hover:bg-black hover:bg-opacity-5 hover:text-opacity-70'>
          <ReorderDotsIcon className='translate-x-0.5' />
        </div>
      )}

      <AttachmentPreview file={file} />

      <p
        className={cn('flex-1 break-all font-mono text-sm', {
          'text-opacity-50': !file.key,
          'text-primary': file.key,
          'text-red-500 text-opacity-100': file.error
        })}
      >
        {file.raw.name}
        {file.error && ' - ' + file.error.message}
      </p>

      {!file.key && !file.error && (
        <span className='pr-2'>
          <LazyLoadingSpinner />
        </span>
      )}

      {(file.key || file.error) && (
        <Button
          onClick={onRemove}
          variant='plain'
          iconOnly={<TrashIcon />}
          tooltip='Remove'
          accessibilityLabel='Remove'
        />
      )}
    </>
  )
}

interface PreviewProps {
  file: TransformedFile
}

function areEqual(prev: PreviewProps, next: PreviewProps) {
  return prev.file === next.file
}

const AttachmentPreview = memo(function Attachment(props: PreviewProps) {
  const { file } = props

  switch (file.raw.type) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/gif':
    case 'image/jpg':
      return (
        <div className='h-8 w-8 flex-none'>
          <ResizedFilePreview file={file} width={36} className='h-full w-full rounded object-cover' />
        </div>
      )
    case 'video/quicktime':
    case 'video/webm':
    case 'video/mp4':
      return (
        <div className='text-primary dark flex h-8 w-8 flex-none items-center justify-center rounded bg-black'>
          <VideoIcon />
        </div>
      )
    case 'origami':
      return (
        <div className='h-8 w-8 flex-none'>
          <Image
            width={36}
            height={36}
            alt='Origami prototype'
            src={'/img/origami.png'}
            className='h-full w-full rounded object-cover'
          />
        </div>
      )
    case 'principle':
      return (
        <div className='h-8 w-8 flex-none'>
          <Image
            width={36}
            height={36}
            alt='Principle prototype'
            src={'/img/principle.png'}
            className='h-full w-full rounded object-cover'
          />
        </div>
      )
    case 'stitch':
      return (
        <div className='h-8 w-8 flex-none'>
          <Image
            width={36}
            height={36}
            alt='Stitch prototype'
            src={'/img/stitch.png'}
            className='h-full w-full rounded object-cover'
          />
        </div>
      )
    case 'lottie':
      return (
        <div className='h-8 w-8 flex-none'>
          <Image
            width={36}
            height={36}
            alt='Lottie animation'
            src={'/img/lottie.png'}
            className='h-full w-full rounded object-cover'
          />
        </div>
      )
    default:
      return null
  }
}, areEqual)
