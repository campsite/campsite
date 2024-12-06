import { Attachment } from '@campsite/types'
import { cn } from '@campsite/ui/src/utils'

import { GalleryThumbnail } from './GalleryThumbnail'

interface Props {
  selectedAttachmentId?: string
  attachments: Attachment[]
  onSelectAttachment: (attachment: Attachment) => void
}

export function Gallery({ selectedAttachmentId, attachments, onSelectAttachment }: Props) {
  return (
    <div className='flex justify-center border-t'>
      <div className='no-drag scrollbar-hide mx-auto flex items-center gap-3 overflow-hidden overflow-x-auto overflow-y-hidden p-3'>
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className={cn('m-auto h-14 w-14 flex-none list-none rounded-md', {
              'outline outline-2 outline-offset-1 outline-blue-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500':
                attachment.id === selectedAttachmentId
            })}
          >
            <button
              type='button'
              className='bg-quaternary relative flex h-full w-full items-center justify-center overflow-hidden rounded-md border'
              onClick={() => onSelectAttachment(attachment)}
            >
              <GalleryThumbnail attachment={attachment} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
