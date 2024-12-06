import { selectHMSMessages, useHMSStore } from '@100mslive/react-sdk'
import { AnimatePresence, m } from 'framer-motion'
import { useAtom } from 'jotai'

import { Button } from '@campsite/ui/Button'
import { ChatBubbleIcon, ChatBubbleUnreadIcon } from '@campsite/ui/Icons'
import { UIText } from '@campsite/ui/Text'
import { cn } from '@campsite/ui/utils'

import { callChatOpenAtom } from '@/atoms/call'
import { CALL_CHAT_SYSTEM_MESSAGE_TYPE } from '@/components/Call/CallChat'

export function ToggleCallChatButton() {
  const [chatOpen, setChatOpen] = useAtom(callChatOpenAtom)
  const messages = useHMSStore(selectHMSMessages)
  const unreadMessage = messages.findLast((message) => !message.read && message.type !== CALL_CHAT_SYSTEM_MESSAGE_TYPE)

  return (
    <div className='group relative'>
      <Button
        variant={chatOpen ? 'none' : 'base'}
        className={cn('dark:group-hover:before:opacity-50', {
          'bg-blue-500 text-gray-50 hover:before:opacity-100': chatOpen
        })}
        iconOnly={
          unreadMessage ? (
            <ChatBubbleUnreadIcon strokeWidth='2' size={24} />
          ) : (
            <ChatBubbleIcon strokeWidth='2' size={24} />
          )
        }
        onClick={() => setChatOpen((prev) => !prev)}
        accessibilityLabel='Toggle chat'
        size='large'
        round
      />
      {unreadMessage && (
        <AnimatePresence>
          <m.div
            className='absolute -top-5 right-7'
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Button
              variant='none'
              className='max-w-20 rounded-[18px] rounded-br bg-neutral-500 px-2 py-1 after:rounded-[18px] after:rounded-br'
              onClick={() => setChatOpen((prev) => !prev)}
            >
              <UIText className='truncate' size='text-xs'>
                {unreadMessage.message}
              </UIText>
            </Button>
          </m.div>
        </AnimatePresence>
      )}
    </div>
  )
}
