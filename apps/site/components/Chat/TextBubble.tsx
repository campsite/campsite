import { cn } from '@campsite/ui'

import { Message, Position } from './types'

export function TextBubble({ message, className }: { message: Message; position: Position; className: string }) {
  const hasReactionsOnly = false

  return (
    <div
      className={cn('relative flex w-full select-none flex-col', className, {
        'bg-quaternary text-primary': !message.viewer_is_sender && !hasReactionsOnly,
        'bg-blue-500 text-white': message.viewer_is_sender && !hasReactionsOnly,
        'px-3.5 py-3 lg:px-3': !hasReactionsOnly,
        'mt-1': hasReactionsOnly && message.reply,
        'rounded-tl': !message.viewer_is_sender && message.reply
      })}
    >
      <span className='flex w-full flex-1 flex-col gap-1.5 sm:gap-2'>
        <div
          className={cn('h-2 rounded-full bg-black/10 dark:bg-white/10', {
            'w-[80%] bg-black/10': !message.viewer_is_sender,
            hidden: message.user.id === '4',
            'w-[60%] bg-blue-100/40 dark:bg-blue-100/30': message.viewer_is_sender
          })}
        />
        <div
          className={cn('h-2 rounded-full bg-black/10 dark:bg-white/10', {
            'w-[70%] bg-black/10': !message.viewer_is_sender,
            'w-[80%] bg-blue-100/40 dark:bg-blue-100/30': message.viewer_is_sender
          })}
        />
        <div
          className={cn('h-2 rounded-full bg-black/10 dark:bg-white/10', {
            'w-[50%] bg-black/10': !message.viewer_is_sender,
            'w-[33%] bg-blue-100/40 dark:bg-blue-100/30': message.viewer_is_sender
          })}
        />
      </span>
    </div>
  )
}
