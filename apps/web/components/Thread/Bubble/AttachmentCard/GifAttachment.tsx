import Image from 'next/image'

import { Attachment } from '@campsite/types'
import { cn } from '@campsite/ui/src/utils'

interface Props {
  attachment: Attachment
  selfSize?: boolean
  cover?: boolean
  maxHeight?: `${number}rem`
}

export function GifAttachment({ attachment, selfSize, cover = false, maxHeight = '44rem' }: Props) {
  const url = attachment.optimistic_src ?? attachment.url
  const { width, height } = attachment
  const isBlob = url.startsWith('blob:')

  return isBlob ? (
    <Image
      unoptimized
      src={url}
      draggable={false}
      className={cn('relative z-[1] max-w-full', {
        'h-full w-full object-cover': cover,
        'object-contain': !cover
      })}
      width={width}
      height={height}
      // providing height and width as style prevents jank during initial upload and loading
      style={{ width, height, maxHeight }}
      alt=''
    />
  ) : (
    <video
      key={attachment.id}
      muted
      loop
      autoPlay
      playsInline
      controls={false}
      preload='metadata'
      draggable={false}
      className={cn('relative max-w-full', {
        'h-full max-h-[44rem]': selfSize && !maxHeight,
        'max-h-full': !selfSize && !maxHeight,
        'h-full w-full object-cover': cover,
        'object-contain': !cover
      })}
      style={{
        width: selfSize ? attachment.width : undefined,
        maxHeight
      }}
    >
      <source src={`${url}?fm=mp4#t=0.1`} type='video/mp4' />
      <source src={`${url}#t=0.1`} />
    </video>
  )
}
