import { Attachment } from '@campsite/types'
import { cn } from '@campsite/ui/src/utils'

import { fitDimensions } from '@/components/Post/Notes/Attachments/ImageAttachment'

interface Props {
  attachment: Attachment
  isUploading: boolean
  editable?: boolean
}

export function VideoAttachment(props: Props) {
  const { attachment, isUploading } = props

  const src = attachment.optimistic_src || attachment.url
  const { width, height } = fitDimensions(attachment)

  return (
    <video
      id={`attachment-${attachment.id}`}
      preload='metadata'
      draggable={false}
      width={width}
      height={height}
      className={cn('h-full max-h-[80vh] w-full max-w-full rounded object-contain transition-shadow', {
        'opacity-30': isUploading
      })}
      poster={attachment.optimistic_preview_src || attachment.preview_url || undefined}
      // providing height and width as style prevents jank during initial upload and loading
      style={{ width, height }}
      onClick={(e) => {
        // enable click to select without playing the video when editing
        if (props.editable) {
          e.preventDefault()
        }
      }}
      playsInline
      controls
    >
      {src && (
        <>
          <source src={`${src}#t=0.1`} type={attachment.file_type} />
          <source src={`${src}#t=0.1`} />
        </>
      )}
    </video>
  )
}
