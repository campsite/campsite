import { LazyLoadingSpinner, LoadingSpinner } from '@campsite/ui/Spinner'
import { cn } from '@campsite/ui/src/utils'
import { UIText } from '@campsite/ui/Text'

import { AudioAttachment } from '@/components/Post/Notes/Attachments/AudioAttachment'
import { NoteAttachmentHoverActions } from '@/components/Post/Notes/Attachments/NoteAttachmentHoverActions'
import { LinkAttachment } from '@/components/Thread/Bubble/AttachmentCard/LinkAttachment'
import { useServerOrOptimisticAttachment } from '@/hooks/useServerOrOptimisticAttachment'

import { GifAttachment } from './Post/Notes/Attachments/GifAttachment'
import { fitDimensions, ImageAttachment } from './Post/Notes/Attachments/ImageAttachment'
import { LottieAttachment } from './Post/Notes/Attachments/LottieAttachment'
import { NoteFileAttachment } from './Post/Notes/Attachments/NoteFileAttachment'
import { VideoAttachment } from './Post/Notes/Attachments/VideoAttachment'

interface InlineAttachmentRendererProps {
  editable?: boolean
  commentsEnabled?: boolean
  onOpen?: (id: string) => void
  onDelete?: () => void

  // untyped props from tiptap node attrs
  id?: any
  optimisticId?: any
  error?: any
  width?: any
  height?: any
}

/**
 * Renders an inline attachment in a ProseMirror document.
 *
 * This is a lower-level component designed to be interoperable between a TipTap editor or our React document renderer.
 */
export function InlineAttachmentRenderer(props: InlineAttachmentRendererProps) {
  const { onOpen, onDelete, editable = false, id, optimisticId, error, width, height } = props

  const { attachment, isUploading, hasServerAttachment } = useServerOrOptimisticAttachment({
    id,
    optimisticId
  })

  const isRenderable =
    !!attachment?.image ||
    !!attachment?.gif ||
    !!attachment?.video ||
    !!attachment?.lottie ||
    !!attachment?.link ||
    !!attachment?.audio

  const clientError = attachment?.client_error || error

  return (
    <div
      className={cn('not-prose group relative flex w-full items-center justify-center rounded leading-none', {
        'hover:bg-secondary': editable,
        // take up space while uploading
        'aspect-video w-full max-w-full': !hasServerAttachment && isUploading && attachment?.remote_figma_url
      })}
    >
      {attachment && isRenderable && !isUploading && <NoteAttachmentHoverActions onDelete={onDelete} />}

      {attachment ? (
        <>
          {isRenderable && (
            <div
              className={cn(
                'group/attachment relative flex h-full w-full select-none items-center justify-center rounded',
                {
                  'pointer-events-none opacity-25': !!clientError
                }
              )}
            >
              {attachment.video && (
                <VideoAttachment attachment={attachment} isUploading={isUploading} editable={editable} />
              )}

              {attachment.audio && <AudioAttachment attachment={attachment} isUploading={isUploading} />}

              {attachment.link && <LinkAttachment attachment={attachment} selfSize />}

              {!attachment.video && !attachment.link && (
                <button
                  type='button'
                  onDoubleClick={editable ? () => onOpen?.(attachment.id) : undefined}
                  onClick={editable ? undefined : () => onOpen?.(attachment.id)}
                  className='flex h-full w-full items-center justify-center'
                >
                  {attachment.image && <ImageAttachment attachment={attachment} isUploading={isUploading} />}
                  {attachment.gif && <GifAttachment attachment={attachment} isUploading={isUploading} />}
                  {attachment.lottie && <LottieAttachment attachment={attachment} isUploading={isUploading} />}
                </button>
              )}
            </div>
          )}

          {!isRenderable && (
            <NoteFileAttachment
              attachment={attachment}
              isUploading={isUploading}
              editable={editable}
              onDelete={onDelete}
            />
          )}
        </>
      ) : (
        !!width && !!height && <SizedAttachmentPlaceholder width={width} height={height} />
      )}

      {attachment?.remote_figma_url && isUploading && (
        <div className='bg-tertiary absolute inset-0 flex flex-col items-center justify-center rounded'>
          <div className='mb-6 scale-[2] opacity-30'>
            <LoadingSpinner />
          </div>
          <UIText weight='font-medium'>Creating Figma preview</UIText>
          <UIText tertiary>This may take a few seconds...</UIText>
        </div>
      )}

      {!!clientError && (
        <div className='absolute inset-0 flex items-center justify-center p-8'>
          <p className='text-primary text-center font-medium'>{clientError}</p>
        </div>
      )}

      {isUploading && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <LazyLoadingSpinner />
        </div>
      )}
    </div>
  )
}

function SizedAttachmentPlaceholder(props: { width: number; height: number }) {
  const { width, height } = fitDimensions(props)

  return (
    <div className='relative flex h-full w-full select-none items-center justify-center'>
      <div
        className='max-h-[50vh] rounded object-contain'
        style={{ width, height, aspectRatio: `${width}/${height}` }}
      />
    </div>
  )
}
