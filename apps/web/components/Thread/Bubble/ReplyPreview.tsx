import { useLayoutEffect, useRef, useState } from 'react'

import { Message, MessageThread } from '@campsite/types'
import { ReplyIcon, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { FileAttachment } from '@/components/FileAttachment'
import { AttachmentCard } from '@/components/Thread/Bubble/AttachmentCard'
import { isRenderable } from '@/utils/attachments'

interface ReplyPreviewProps {
  message: Message
  position: 'first' | 'middle' | 'last' | 'only'
  thread: MessageThread
}

export function ReplyPreview({ message, thread, position }: ReplyPreviewProps) {
  const replyTextRef = useRef<HTMLDivElement>(null)
  const [replyClamped, setReplyClamped] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)

  useLayoutEffect(() => {
    if (replyTextRef.current) {
      setReplyClamped(replyTextRef.current.scrollHeight > replyTextRef.current.clientHeight)
    }
  }, [])

  if (!message.reply) return null

  return (
    <div className='flex max-w-[calc(min(80%,_36rem))]'>
      <div
        className={cn('flex flex-col gap-1', {
          'items-end pl-2': message.viewer_is_sender,
          'items-start': !message.viewer_is_sender,
          'pt-2': position !== 'first' && !thread.group,
          'pt-0': position !== 'first'
        })}
      >
        <div
          className={cn('text-quaternary flex items-center gap-1', {
            'mr-3.5 lg:mr-3': message.viewer_is_sender,
            'ml-2.5': !message.viewer_is_sender,
            'mt-1': position !== 'first'
          })}
        >
          <ReplyIcon strokeWidth='2' size={12} />
          <UIText size='text-xs' className='line-clamp-1'>
            Replying to{' '}
            {message.reply.viewer_is_sender ? (
              message.viewer_is_sender ? (
                'yourself'
              ) : (
                'you'
              )
            ) : (
              <UIText element='span' size='text-xs' weight='font-medium'>
                {message.reply.sender_display_name}
              </UIText>
            )}
          </UIText>
        </div>

        <div
          className={cn('bg-quaternary relative flex-none rounded-[14px]', {
            'cursor-pointer': replyClamped,
            'rounded-br': message.viewer_is_sender,
            'rounded-bl': !message.viewer_is_sender
          })}
          onClick={(evt) => {
            if (!replyClamped) return

            const didClickLinkOrButton =
              evt.target instanceof Element && (evt.target.closest('a') || evt.target.closest('button'))

            if (didClickLinkOrButton) return
            setReplyOpen(!replyOpen)
          }}
        >
          {message.reply?.has_content ? (
            <div className='px-3.5 py-1.5 lg:px-3'>
              <div
                ref={replyTextRef}
                className={cn(
                  'text-tertiary chat-prose reply-prose max-w-md text-xs',
                  !replyOpen && 'break-anywhere line-clamp-1 break-all'
                )}
                dangerouslySetInnerHTML={{ __html: message.reply.content }}
              />
            </div>
          ) : (
            message.reply?.last_attachment && (
              <div>
                {isRenderable(message.reply.last_attachment) ? (
                  <div className='w-20 max-w-[80px] opacity-50'>
                    <div
                      className='max-h-full self-center'
                      style={{
                        aspectRatio: `${message.reply.last_attachment.width || 1} / ${
                          message.reply.last_attachment.height || 1
                        }`
                      }}
                    >
                      <div className={cn('flex shrink-0 items-center justify-center', 'absolute inset-0')}>
                        <div
                          className={cn('relative h-full w-full overflow-hidden rounded-[14px]', {
                            'rounded-br': message.viewer_is_sender,
                            'rounded-bl': !message.viewer_is_sender
                          })}
                        >
                          <AttachmentCard attachment={message.reply.last_attachment} />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='max-w-[160px] opacity-70'>
                    <div className={cn('relative flex w-full flex-col')}>
                      <FileAttachment attachment={message.reply.last_attachment} showActions={false} />
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
