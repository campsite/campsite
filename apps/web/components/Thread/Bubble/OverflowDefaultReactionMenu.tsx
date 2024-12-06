import Image from 'next/image'

import { SyncCustomReaction } from '@campsite/types/generated'
import { Button } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import { isStandardReaction, StandardReaction } from '@/utils/reactions'

export const DEFAULT_REACTIONS: StandardReaction[] = [
  { id: '+1', name: 'Thumbs Up', native: '👍' },
  { id: 'heart', name: 'Red Heart', native: '❤️' },
  { id: 'thinking_face', name: 'Thinking Face', native: '🤔' },
  { id: 'joy', name: 'Face with Tears of Joy', native: '😂' },
  { id: 'open_mouth', name: 'Face with Open Mouth', native: '😮' }
]

interface OverflowDefaultButtonProps {
  reaction: StandardReaction | SyncCustomReaction
  onReactionSelect: (emoji: StandardReaction | SyncCustomReaction) => void
  hasReacted: boolean
}

export function OverflowDefaultReactionButton({ reaction, onReactionSelect, hasReacted }: OverflowDefaultButtonProps) {
  return (
    <Button
      iconOnly={
        <span className={cn('font-[emoji] text-[26px] leading-none transition-all duration-150')}>
          {isStandardReaction(reaction) ? (
            <span className='relative -bottom-px leading-none'>{reaction.native}</span>
          ) : (
            <Image
              data-vaul-no-drag
              className='h-6.5 w-6.5 object-contain'
              src={reaction.file_url ?? ''}
              alt={reaction.name}
              width={30}
              height={30}
            />
          )}
        </span>
      }
      accessibilityLabel={reaction.name}
      className={cn('bg-tertiary h-12 w-12', {
        'bg-blue-200/70 hover:bg-blue-100 dark:bg-blue-900/60 dark:shadow-[inset_0_0_1px_rgb(255_255_255_/_0.1)] dark:hover:bg-blue-900/60':
          hasReacted,
        'hover:bg-tertiary dark:hover:bg-tertiary': !hasReacted
      })}
      variant='plain'
      onClick={() => onReactionSelect(reaction)}
      round
      size='large'
    />
  )
}
