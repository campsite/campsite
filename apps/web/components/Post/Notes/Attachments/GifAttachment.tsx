import Image from 'next/image'

import { Attachment } from '@campsite/types'
import { cn } from '@campsite/ui/src/utils'

interface Props {
  attachment: Attachment
  isUploading: boolean
}

export function GifAttachment({ attachment, isUploading }: Props) {
  const { width, height } = attachment

  return (
    <div
      className={cn('relative flex h-full max-h-[80vh] w-full items-center justify-center', {
        'opacity-30': isUploading
      })}
    >
      {attachment.optimistic_src && (
        <Image
          alt='Gif attachment'
          src={attachment.optimistic_src}
          width={width}
          height={height}
          draggable={false}
          className='max-h-[80vh] rounded object-contain'
          // providing width and aspectRatio styles prevents jank during initial upload and loading
          style={{ width, aspectRatio: `${width}/${height}` }}
        />
      )}

      {!attachment.optimistic_src && attachment.url && (
        <video
          muted
          loop
          autoPlay
          playsInline
          controls={false}
          draggable={false}
          preload='metadata'
          className='max-h-[80vh] rounded object-contain'
          width={width}
          height={height}
          // providing width and aspectRatio styles prevents jank during initial upload and loading
          style={{ width, aspectRatio: `${width}/${height}` }}
        >
          <source src={`${attachment.url}?fm=mp4#t=0.1`} type={'video/mp4'} />
          <source src={`${attachment.url}#t=0.1`} />
        </video>
      )}
    </div>
  )
}
