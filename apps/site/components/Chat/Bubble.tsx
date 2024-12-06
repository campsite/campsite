import { Avatar, cn } from '@campsite/ui'

import { getBorderRadiusClasses } from './getBorderRadiusClasses'
import { MessageCallBubble } from './MessageCallBubble'
import { TextBubble } from './TextBubble'
import { GroupedReaction, Message, MessageThread, Position } from './types'

export function Bubble({ message, thread, position }: { message: Message; thread: MessageThread; position: Position }) {
  const shouldRenderAvatar = message.viewer_is_sender
    ? false
    : thread.group
      ? position === 'last' || position === 'only'
      : false

  let normalizedPosition = position

  if ((message.attachments.length > 0 && !!message.content) || message.unfurled_link) {
    if (normalizedPosition === 'only') {
      normalizedPosition = 'last'
    } else if (normalizedPosition === 'first') {
      normalizedPosition = 'middle'
    }
  }

  const roundedClasses = getBorderRadiusClasses(normalizedPosition, message)

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
          <span className='-translate-y-1 self-end'>
            <Avatar
              src={message.user.avatar_url}
              size='base'
              rounded={message.user.integration ? 'rounded' : 'rounded-full'}
            />
          </span>
        )}

        {!shouldRenderAvatar && thread.group && !message.viewer_is_sender && <div className='w-8 flex-none' />}

        <div
          className={cn('group/bubble relative flex flex-1 flex-col transition-opacity', {
            'items-end': message.viewer_is_sender,
            'items-start': !message.viewer_is_sender,
            'mb-0.5': true
          })}
        >
          <div
            className={cn(
              'relative flex w-full max-w-[80%] flex-1 flex-col items-end gap-0.5',
              !message.viewer_is_sender && 'items-start',
              !!message.call && 'max-w-full',
              {}
            )}
          >
            {(!!message.content || message.call) && (
              <div
                className={cn(
                  'flex w-full items-center justify-end gap-1.5',
                  !message.viewer_is_sender && 'flex-row-reverse'
                )}
              >
                {message.call && <MessageCallBubble call={message.call} className={roundedClasses} />}

                {!!message.content && (
                  <>
                    <TextBubble message={message} position={position} className={roundedClasses} />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Engagements message={message} thread={thread} />
    </div>
  )
}

function Engagements({ message, thread }: { message: Message; thread: MessageThread }) {
  const hasReactionsOrSharedPost = message.grouped_reactions && message.grouped_reactions.length > 0

  if (!hasReactionsOrSharedPost) return null

  return (
    <div
      className={cn(
        '-mb-0.5 flex -translate-y-1.5 flex-row',
        'z-10', // ensure reactions are above attachments only bubbles
        {
          'self-start': !message.viewer_is_sender,
          '-translate-x-1 self-end': message.viewer_is_sender
        }
      )}
    >
      {thread.group && <div className='w-11 flex-none' />}
      <BubbleReactions message={message} />
    </div>
  )
}

function getClasses() {
  return cn(
    'flex justify-center pointer-events-auto items-center',
    'pl-1.5 pr-[7px] h-5.5 text-[11px] gap-[5px]',
    'group rounded-full font-medium min-w-[32px]',
    'bg-tertiary dark:bg-quaternary'
  )
}

function BubbleReactions({ message }: { message: Message }) {
  if (!message.grouped_reactions || message.grouped_reactions.length === 0) return null

  return (
    <div
      className={cn(
        'ring-primary h-5.5 bg-primary dark:ring-gray-850 flex flex-wrap items-center gap-0.5 rounded-full px-px shadow-sm ring-2 dark:bg-gray-800',
        {
          'flex-row-reverse': message.viewer_is_sender
        }
      )}
    >
      <Reactions reactions={message.grouped_reactions} getClasses={getClasses} />
    </div>
  )
}

function Reactions({ reactions, getClasses }: { reactions: GroupedReaction[]; getClasses: () => string }) {
  if (!reactions || reactions.length === 0) return null

  return (
    <>
      <>
        {reactions.map((reaction) => {
          if (reaction.reactions_count === 0) return null

          return (
            <span key={reaction.emoji}>
              <span className={getClasses()}>
                {reaction.emoji && <span className='mt-0.5 font-["emoji"] text-sm leading-none'>{reaction.emoji}</span>}
              </span>
            </span>
          )
        })}
      </>
    </>
  )
}
