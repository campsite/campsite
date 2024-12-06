import { memo } from 'react'
import { useAtomValue } from 'jotai'

import { UIText } from '@campsite/ui/Text'
import { cn } from '@campsite/ui/utils'

import { chatThreadPlacementAtom } from '@/components/Chat/atoms'
import { useChatTypingIndicator } from '@/hooks/useChatTypingIndicators'

interface TypingIndicatorProps {
  threadId?: string
  channelName?: string
}

export const TypingIndicator = memo(function TypingIndicator({ threadId, channelName }: TypingIndicatorProps) {
  const typers = useChatTypingIndicator({ threadId, channelName })
  const threadPlacement = useAtomValue(chatThreadPlacementAtom)

  return (
    <div
      className={cn('pl-3.5asdfas pointer-events-none mt-1 lg:h-3.5', {
        hidden: !!threadPlacement, // hovercard
        'hidden lg:flex': !threadPlacement // not hovercard
      })}
    >
      <UIText tertiary size='text-[11px]'>
        {typers.length > 2 && 'Several people are typing...'}
        {typers.length === 2 && (
          <>
            <span className='font-medium'>
              {typers[0].display_name} and {typers[1].display_name}
            </span>{' '}
            are typing...
          </>
        )}
        {typers.length === 1 && (
          <>
            <span className='font-medium'>{typers[0].display_name}</span> is typing...
          </>
        )}
        {typers.length === 0 && ''}
      </UIText>
    </div>
  )
})

export const MobileTypingIndicator = memo(function TypingIndicator({ threadId, channelName }: TypingIndicatorProps) {
  const threadPlacement = useAtomValue(chatThreadPlacementAtom)
  const typers = useChatTypingIndicator({ threadId, channelName })

  if (typers.length === 0) return null

  return (
    <div
      className={cn('bg-tertiary pointer-events-none items-center px-3 py-2.5', {
        flex: !!threadPlacement, // hovercard
        'flex lg:hidden': !threadPlacement // not hovercard
      })}
    >
      <UIText tertiary size='text-xs'>
        {typers.length > 2 && 'Several people are typing...'}
        {typers.length === 2 && (
          <>
            <span className='font-medium'>
              {typers[0].display_name} and {typers[1].display_name}
            </span>{' '}
            are typing...
          </>
        )}
        {typers.length === 1 && (
          <>
            <span className='font-medium'>{typers[0].display_name}</span> is typing...
          </>
        )}
      </UIText>
    </div>
  )
})
