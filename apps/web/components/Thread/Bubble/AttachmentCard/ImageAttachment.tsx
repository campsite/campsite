import { useAtomValue } from 'jotai'
import Image from 'next/image'

import { Attachment } from '@campsite/types'
import { cn } from '@campsite/ui/src/utils'

import { getLocalSrcAtom } from '@/hooks/useUploadChatAttachments'

interface Props {
  attachment: Attachment
  selfSize?: boolean
  cover?: boolean
  onError?: () => void
  maxHeight?: `${number}rem`
}

export function ImageAttachment({ attachment, selfSize, cover = false, onError, maxHeight }: Props) {
  const getLocalSrc = useAtomValue(getLocalSrcAtom)

  const src = getLocalSrc(attachment.optimistic_id || attachment.id) || attachment.image_urls?.feed_url

  if (!src) return null

  const fallbackWidth = 500
  const fallbackHeight = 375
  const width = Math.min(attachment.width ?? fallbackWidth, fallbackWidth)
  const height = Math.min(attachment.height ?? fallbackHeight, fallbackHeight)

  return (
    <div className={cn({ 'flex h-full w-full items-center justify-center': !cover, content: cover })}>
      <Image
        alt={attachment.name ?? 'Image attachment'}
        src={src}
        width={width}
        height={height}
        draggable={false}
        className={cn('max-w-full', {
          'max-h-[44rem]': selfSize && !maxHeight,
          'max-h-full': !selfSize && !maxHeight,
          'h-full object-cover': cover,
          'object-contain': !cover,
          'object-top': cover && attachment.height > attachment.width
        })}
        style={{
          width: selfSize ? width : '100%',
          maxHeight
        }}
        onError={onError}
      />
    </div>
  )
}
