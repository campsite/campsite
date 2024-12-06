import Image from 'next/image'

import { Attachment } from '@campsite/types'
import { LinkIcon, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { embedType, transformUrl } from '@/components/Post/PostEmbeds/transformUrl'

interface Props {
  attachment: Attachment
  onError?: () => void
}

export function LinkAttachmentStatic(props: Props) {
  const { attachment, onError } = props

  const linkType = embedType(attachment.url)

  const fallbackWidth = 500
  const fallbackHeight = 375
  const width = Math.min(attachment.width ?? fallbackWidth, fallbackWidth)
  const height = Math.min(attachment.height ?? fallbackHeight, fallbackHeight)
  const src = attachment.preview_url ?? ''

  const { logo, title } = transformUrl(linkType, attachment.url)
  const domain = new URL(attachment.url).hostname

  if (!src) {
    return (
      <div className='bg-secondary text-quaternary relative flex aspect-video h-full w-full flex-col items-center justify-center gap-1.5 rounded-md border'>
        {logo && title && (
          <Image
            width={72}
            height={72}
            alt='Link attachment'
            src={logo}
            className='pointer-events-none rounded-xl'
            draggable={false}
            onError={onError}
          />
        )}
        {!title && <LinkIcon size={24} />}
        {!title && (
          <UIText size='text-xs' weight='font-semibold' className='font-mono'>
            {domain}
          </UIText>
        )}
      </div>
    )
  }

  return (
    <div className='relative flex aspect-video h-full w-full flex-col items-center justify-center bg-black'>
      {logo && (
        <Image
          width={24}
          height={24}
          alt='Link attachment'
          src={logo}
          className='pointer-events-none absolute left-1 top-1 rounded'
          draggable={false}
          onError={onError}
        />
      )}

      {src && (
        <div className='flex h-full w-full items-center justify-center'>
          <Image
            alt={attachment.name || 'Link attachment'}
            src={src}
            width={width}
            height={height}
            draggable={false}
            className={cn('max-h-[44rem] w-full max-w-full object-contain', {})}
            onError={onError}
          />
        </div>
      )}
    </div>
  )
}
