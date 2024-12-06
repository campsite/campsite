import { Attachment } from '@campsite/types'
import { cn } from '@campsite/ui/src/utils'

interface Props {
  attachment: Attachment
  selfSize?: boolean
  cover?: boolean
  autoplay?: boolean
  maxHeight?: `${number}rem`
}

export function VideoAttachment({ attachment, selfSize, cover = false, autoplay = true, maxHeight }: Props) {
  const url = attachment.optimistic_src ?? attachment.url

  return (
    <video
      key={attachment.id}
      muted
      loop={attachment.duration < 60000} // loop if less than one minute
      controls={true}
      preload='metadata'
      draggable={false}
      playsInline
      autoPlay={autoplay}
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
      <source src={`${url}#t=0.1`} type={attachment.file_type} />
      <source src={`${url}#t=0.1`} />
    </video>
  )
}
