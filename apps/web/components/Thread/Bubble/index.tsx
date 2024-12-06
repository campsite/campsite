import { useEffect, useMemo, useState } from 'react'
import { Extension } from '@tiptap/core'
import { atom, useAtomValue } from 'jotai'
import { useLongPress } from 'react-aria'

import { getChatExtensions } from '@campsite/editor'
import { Message, MessageThread } from '@campsite/types'
import { Link, Tooltip, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { chatThreadPlacementAtom, editModeAtom } from '@/components/Chat/atoms'
import { MemberAvatar } from '@/components/MemberAvatar'
import { RichLinkCard } from '@/components/RichLinkCard'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { Attachments } from '@/components/Thread/Bubble/Attachments'
import { MessageCallBubble } from '@/components/Thread/Bubble/MessageCallBubble'
import { Overflow } from '@/components/Thread/Bubble/Overflow'
import { ReplyPreview } from '@/components/Thread/Bubble/ReplyPreview'
import { useScope } from '@/contexts/scope'
import { useCanHover } from '@/hooks/useCanHover'
import { createMessageStateAtom, useRetryCreateMessage } from '@/hooks/useCreateMessage'
import { containsOnlyReactions } from '@/utils/reactions/containsOnlyReactions'
import { longTimestamp } from '@/utils/timestamp'

import { Engagements } from './Engagements'
import { isMessageOptimistic } from './isMessageOptimistic'

type Position = 'first' | 'middle' | 'last' | 'only'

export function getBorderRadiusClasses(position: Position, viewer_is_sender: boolean) {
  if (viewer_is_sender) {
    switch (position) {
      case 'first':
        return 'rounded-[18px] rounded-br after:rounded-[18px] after:rounded-br'
      case 'middle':
        return 'rounded-r rounded-l-[18px] after:rounded-r after:rounded-l-[18px]'
      case 'last':
        return 'rounded-l-[18px] rounded-tr rounded-br-[18px] after:rounded-l-[18px] after:rounded-tr after:rounded-br-[18px]'
      case 'only':
        return 'rounded-[18px] after:rounded-[18px]'
    }
  } else {
    switch (position) {
      case 'first':
        return 'rounded-[18px] rounded-bl after:rounded-[18px] after:rounded-bl'
      case 'middle':
        return 'rounded-l rounded-r-[18px] after:rounded-l after:rounded-r-[18px]'
      case 'last':
        return 'rounded-r-[18px] rounded-tl rounded-bl-[18px] after:rounded-r-[18px] after:rounded-tl after:rounded-bl-[18px]'
      case 'only':
        return 'rounded-[18px] after:rounded-[18px]'
    }
  }
}

function isGroupOrIntegrationDm(thread: MessageThread) {
  return thread.group || thread.integration_dm
}

interface Props {
  message: Message
  thread: MessageThread
  position: Position
}

export function Bubble({ message, thread, position }: Props) {
  const { scope } = useScope()
  const canHover = useCanHover()
  const editMode = useAtomValue(editModeAtom)
  const [overflowOpen, setOverflowOpen] = useState(false)
  const isOptimistic = isMessageOptimistic(message)
  const threadPlacement = useAtomValue(chatThreadPlacementAtom)
  const { longPressProps: maybeLongPressProps } = useLongPress({
    accessibilityDescription: 'Long press to open actions',
    onLongPress() {
      setOverflowOpen(true)
    }
  })
  const longPressProps = !!message.discarded_at || canHover || isOptimistic ? {} : maybeLongPressProps
  const shouldRenderAvatar = message.viewer_is_sender
    ? false
    : isGroupOrIntegrationDm(thread)
      ? position === 'last' || position === 'only'
      : false

  let normalizedPosition = position

  if ((message.attachments.length > 0 && message.has_content) || message.unfurled_link) {
    if (normalizedPosition === 'only') {
      normalizedPosition = 'last'
    } else if (normalizedPosition === 'first') {
      normalizedPosition = 'middle'
    }
  }
  const roundedClasses = getBorderRadiusClasses(normalizedPosition, message.viewer_is_sender)

  return (
    <div
      className={cn('flex flex-col', {
        'items-end': message.viewer_is_sender,
        'items-start': !message.viewer_is_sender
      })}
    >
      <div className='flex w-full gap-2'>
        {/* avatar column */}
        {shouldRenderAvatar && (
          <Link href={`/${scope}/people/${message.sender.user.username}`} className='-translate-y-1 self-end'>
            <MemberAvatar member={message.sender} size='base' />
          </Link>
        )}

        {!shouldRenderAvatar && isGroupOrIntegrationDm(thread) && !message.viewer_is_sender && (
          <div className='w-8 flex-none' />
        )}

        <div
          className={cn('group/bubble relative flex flex-1 flex-col transition-opacity', {
            'opacity-30': editMode && editMode.id !== message.id,
            'items-end': message.viewer_is_sender,
            'items-start': !message.viewer_is_sender,
            'mb-0.5': message.grouped_reactions.length === 0
          })}
          onContextMenu={(evt) => {
            if (isOptimistic || canHover) return
            evt.preventDefault()
          }}
          {...longPressProps}
        >
          <div
            className={cn(
              'relative flex w-full flex-1 flex-col items-end gap-0.5',
              !message.viewer_is_sender && 'items-start',
              {
                'max-w-full': !!threadPlacement, // hovercard
                'max-w-[80%]': !threadPlacement // not hovercard
              }
            )}
          >
            <ReplyPreview message={message} thread={thread} position={position} />

            {!message.discarded_at && message.unfurled_link && !message.attachments.length && (
              <div
                className={cn(
                  'relative flex w-full ring-2 ring-[--bg-primary] sm:max-w-md',
                  {
                    'justify-start': !message.viewer_is_sender,
                    'justify-end': message.viewer_is_sender
                  },
                  getBorderRadiusClasses(
                    message.reply?.id ? 'middle' : position === 'first' || position === 'only' ? 'first' : 'middle',
                    message.viewer_is_sender
                  )
                )}
              >
                <RichLinkCard
                  className={getBorderRadiusClasses(
                    message.reply?.id ? 'middle' : position === 'first' || position === 'only' ? 'first' : 'middle',
                    message.viewer_is_sender
                  )}
                  url={message.unfurled_link}
                />
              </div>
            )}

            {!!message.attachments.length && (
              <Attachments message={message} thread={thread} overflowState={[overflowOpen, setOverflowOpen]} />
            )}

            {(message.has_content || message.discarded_at || message.call) && (
              <div
                className={cn(
                  'flex w-full items-center justify-end gap-1.5',
                  !message.viewer_is_sender && 'flex-row-reverse'
                )}
              >
                {message.call && (
                  <MessageCallBubble thread={thread} call={message.call} className={roundedClasses} message={message} />
                )}

                {(message.has_content || message.discarded_at) && (
                  <>
                    <Overflow message={message} thread={thread} state={[overflowOpen, setOverflowOpen]} />
                    <TextBubble message={message} thread={thread} position={position} className={roundedClasses} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Engagements message={message} thread={thread} />
      <EditedIndicator message={message} position={position} thread={thread} />

      {message.optimistic_id && (
        <StatusIndicators message={message} position={position} optimisticId={message.optimistic_id} />
      )}
    </div>
  )
}

function TextBubble({
  message,
  thread,
  position,
  className
}: {
  message: Message
  thread: MessageThread
  position: Position
  className: string
}) {
  const canHover = useCanHover()
  const hasReactionsOnly = useMemo(() => containsOnlyReactions(message.content), [message.content])
  const extensions = useMemo(() => getChatExtensions() as Extension[], [])

  return (
    <Tooltip
      align={message.viewer_is_sender ? 'end' : 'start'}
      label={longTimestamp(message.created_at, { month: 'short' })}
    >
      <div
        className={cn('chat-prose relative select-text whitespace-pre-wrap break-words', className, {
          'bg-quaternary text-primary': !message.viewer_is_sender && !hasReactionsOnly,
          'bg-blue-500 text-white': message.viewer_is_sender && !message.discarded_at && !hasReactionsOnly,
          'bg-quaternary text-tertiary': message.discarded_at && !hasReactionsOnly,
          'px-3.5 py-2 lg:px-3': !hasReactionsOnly,
          'px-2.5':
            position === 'only' && hasReactionsOnly && !message.viewer_is_sender && isGroupOrIntegrationDm(thread),
          'pt-1':
            position === 'first' && hasReactionsOnly && !message.viewer_is_sender && isGroupOrIntegrationDm(thread),
          'ring-2 ring-[--bg-primary]': message.reply && !hasReactionsOnly,
          'mt-1': hasReactionsOnly && message.reply,
          'rounded-tr': message.viewer_is_sender && message.reply,
          'rounded-tl': !message.viewer_is_sender && message.reply,
          'select-none': !canHover,
          'viewer-chat-prose': message.viewer_is_sender
        })}
        data-reactions-only={hasReactionsOnly}
      >
        <RichTextRenderer content={message.content} extensions={extensions} />
      </div>
    </Tooltip>
  )
}

function EditedIndicator({
  message,
  position,
  thread
}: {
  message: Message
  position: Position
  thread: MessageThread
}) {
  if (!message.updated_at || message.updated_at === message.created_at || message.discarded_at) return null

  return (
    <div
      className={cn('flex', {
        'self-start pl-3.5 lg:pl-3': !message.viewer_is_sender,
        'self-end pr-3.5 lg:pr-3': message.viewer_is_sender,
        'pb-1.5': position !== 'last' && position !== 'only'
      })}
    >
      {!message.viewer_is_sender && isGroupOrIntegrationDm(thread) && <div className='w-10 flex-none' />}
      <Tooltip
        align={message.viewer_is_sender ? 'end' : 'start'}
        label={`Edited ${longTimestamp(message.updated_at, { month: 'short' })}`}
      >
        <div
          className={cn('text-quaternary flex items-center', {
            'items-start': !message.viewer_is_sender,
            'items-end': message.viewer_is_sender
          })}
        >
          <UIText size='text-xs'>Edited</UIText>
        </div>
      </Tooltip>
    </div>
  )
}

function StatusIndicators({
  message,
  position,
  optimisticId
}: {
  message: Message
  position: Position
  optimisticId: string
}) {
  const [showPending, setShowPending] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowPending(true)
    }, 2000)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  const isOptimistic = isMessageOptimistic(message)
  const state = useAtomValue(useMemo(() => atom((get) => get(createMessageStateAtom)[optimisticId]), [optimisticId]))
  const retryMutation = useRetryCreateMessage()

  if (!isOptimistic || !state) return null

  return (
    <div
      className={cn('flex self-end pr-3.5 lg:pr-3', {
        'pb-1.5':
          position !== 'last' &&
          position !== 'only' &&
          (state.status === 'error' || (state.status === 'pending' && showPending))
      })}
    >
      {state.status === 'error' && (
        <button
          disabled={retryMutation.isPending}
          onClick={() => {
            retryMutation.mutate({
              optimisticId,
              ...state.data
            })
          }}
          className='text-quaternary flex items-end text-right'
        >
          <UIText className='text-red-500' size='text-xs'>
            Failed to send · Retry
          </UIText>
        </button>
      )}

      {state.status === 'pending' && showPending && (
        <UIText size='text-xs' className='text-quaternary'>
          Still sending...
        </UIText>
      )}
    </div>
  )
}
