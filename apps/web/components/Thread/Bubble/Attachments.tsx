import { Fragment, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import JSZip from 'jszip'
import dynamic from 'next/dynamic'

import { Attachment, Message, MessageThread } from '@campsite/types'
import { Button, downloadFile, DownloadIcon, LoadingSpinner, Tooltip, UIText } from '@campsite/ui'
import { cn, ConditionalWrap } from '@campsite/ui/src/utils'

import { FileTypeIcon } from '@/components/FileTypeIcon'
import { AttachmentCard } from '@/components/Thread/Bubble/AttachmentCard'
import { Overflow, OverflowProps } from '@/components/Thread/Bubble/Overflow'
import { useCanHover } from '@/hooks/useCanHover'
import { isRenderable } from '@/utils/attachments'
import { getFileMetadata } from '@/utils/getFileMetadata'
import { longTimestamp } from '@/utils/timestamp'

const AttachmentLightbox = dynamic(
  () => import('@/components/AttachmentLightbox').then((mod) => mod.AttachmentLightbox),
  {
    ssr: false
  }
)

interface AttachmentsProps {
  message: Message
  thread: MessageThread
  overflowState: OverflowProps['state']
}

const MAX_RENDERED_ATTACHMENTS = 4

export function Attachments({ message, thread, overflowState }: AttachmentsProps) {
  const canHover = useCanHover()
  const [selected, setSelected] = useState<string | undefined>(undefined)

  const { renderables, nonRenderables } = useMemo(() => {
    const renderables: Attachment[] = []
    const nonRenderables: Attachment[] = []

    message.attachments.forEach((attachment) => {
      if (isRenderable(attachment)) {
        renderables.push(attachment)
      } else {
        nonRenderables.push(attachment)
      }
    })

    return { renderables, nonRenderables }
  }, [message.attachments])

  if (!message.attachments.length) return null

  return (
    <Tooltip
      asChild
      align={message.viewer_is_sender ? 'end' : 'start'}
      label={longTimestamp(message.created_at, { month: 'short' })}
    >
      <div
        className={cn(
          'flex w-full max-w-4xl items-center justify-end md:w-auto',
          !message.viewer_is_sender && 'flex-row-reverse'
        )}
      >
        <div className={cn('w-32 shrink-0', !canHover && 'w-12')} />

        <div
          className={cn('relative flex flex-1 flex-col justify-end gap-1', {
            'justify-start': !message.viewer_is_sender
          })}
        >
          <Actions message={message} thread={thread} overflowState={overflowState} />

          {renderables.length > 0 && (
            <div className='flex gap-0.5'>
              {renderables.slice(0, MAX_RENDERED_ATTACHMENTS).map((attachment, index) => {
                const only = renderables.length === 1
                const overflow = index === MAX_RENDERED_ATTACHMENTS - 1 && renderables.length > MAX_RENDERED_ATTACHMENTS
                const aspectRatio = (attachment.width || 1) / (attachment.height || 1)

                return (
                  <div
                    key={attachment.id}
                    className={cn('bg-elevated relative flex-1 rounded-lg', {
                      'max-h-[44rem]': only
                    })}
                    style={{ aspectRatio }}
                  >
                    <div className='pointer-events-none absolute inset-0 z-[1] rounded-lg ring-1 ring-inset ring-[--border-primary]' />

                    <ConditionalWrap
                      condition={overflow}
                      wrap={(c) => (
                        <div className='bg-quaternary absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg'>
                          <UIText className='pointer-events-none relative z-[1]' size='text-base' tertiary>
                            +{renderables.length - (MAX_RENDERED_ATTACHMENTS - 1)}
                          </UIText>
                          <div className='absolute inset-0 opacity-30 blur-[10px]'>{c}</div>
                        </div>
                      )}
                    >
                      <button
                        onClick={() => setSelected(attachment.id)}
                        className='flex h-full w-full items-center justify-center overflow-hidden rounded-lg'
                      >
                        <AttachmentCard attachment={attachment} autoplay={false} />
                      </button>
                    </ConditionalWrap>
                  </div>
                )
              })}
            </div>
          )}

          {nonRenderables.map((attachment) => (
            <NonRenderableAttachment key={attachment.id} attachment={attachment} message={message} />
          ))}

          <AttachmentLightbox
            portalContainer='lightbox-portal'
            subject={message}
            selectedAttachmentId={selected}
            attachments={renderables}
            viewOnly
            onClose={() => {
              setSelected(undefined)
            }}
            onSelectAttachment={(attachment) => {
              setSelected(attachment.id)
            }}
          />
        </div>
      </div>
    </Tooltip>
  )
}

interface ActionsProps {
  message: Message
  thread: MessageThread
  overflowState: OverflowProps['state']
}

function Actions({ message, thread, overflowState }: ActionsProps) {
  const download = useMutation({
    mutationFn: async () => {
      if (!message.attachments.length) return

      if (message.attachments.length === 1) {
        const attachment = message.attachments[0]
        const metadata = getFileMetadata(attachment)

        if (metadata.downloadUrl) {
          downloadFile(metadata.downloadUrl, metadata.name)
        }
      } else {
        const zip = new JSZip()

        message.attachments.forEach((attachment) => {
          const metadata = getFileMetadata(attachment)

          if (metadata.downloadUrl) {
            zip.file(
              metadata.name,
              fetch(metadata.downloadUrl).then((res) => res.blob())
            )
          }
        })

        const blob = await zip.generateAsync({ type: 'blob' })
        const a = document.createElement('a')

        a.href = URL.createObjectURL(blob)
        a.download = `${message.attachments.length} attachments.zip`
        a.click()

        URL.revokeObjectURL(a.href)
      }
    }
  })

  return (
    <div
      className={cn(
        'absolute inset-y-0 flex items-center justify-center gap-1.5',
        message.viewer_is_sender && '-left-3 -translate-x-full',
        !message.viewer_is_sender && '-right-3 translate-x-full flex-row-reverse'
      )}
    >
      {!message.has_content && <Overflow message={message} thread={thread} state={overflowState} />}

      <Button
        round
        tooltip={message.attachments.length > 1 ? 'Download all' : 'Download'}
        accessibilityLabel={message.attachments.length > 1 ? 'Download all' : 'Download'}
        disabled={download.isPending}
        iconOnly={download.isPending ? <LoadingSpinner /> : <DownloadIcon size={16} />}
        onClick={() => download.mutate()}
      />
    </div>
  )
}

interface NonRenderableAttachmentProps {
  attachment: Attachment
  message: Message
}

function NonRenderableAttachment({ attachment, message }: NonRenderableAttachmentProps) {
  const metadata = getFileMetadata(attachment)
  const nameParts = metadata.name.split('.')

  const download = () => {
    if (metadata.downloadUrl) {
      downloadFile(metadata.downloadUrl, metadata.name)
    }
  }

  return (
    <button
      onClick={download}
      className={cn('flex items-center gap-2 self-start rounded-lg border py-2 pl-2 pr-3', {
        'self-end': message.viewer_is_sender
      })}
    >
      <FileTypeIcon {...metadata} />

      <UIText
        size='text-xs'
        tertiary
        className={cn(
          'line-clamp-2 text-center font-mono md:line-clamp-3',
          message.attachments.length > 2 && 'max-sm:hidden',
          message.attachments.length > 1 && 'max-xs:hidden'
        )}
      >
        {nameParts.map((p, i) => (
          <Fragment key={p}>
            {p}
            {i < nameParts.length - 1 && (
              <>
                <wbr />.
              </>
            )}
          </Fragment>
        ))}
      </UIText>
    </button>
  )
}
