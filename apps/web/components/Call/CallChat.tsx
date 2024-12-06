import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  HMSMessage,
  HMSPeer,
  selectHMSMessages,
  selectLocalPeer,
  useHMSActions,
  useHMSStore
} from '@100mslive/react-sdk'
import { useAtomValue } from 'jotai'
import Linkify from 'linkify-react'
import { useRouter } from 'next/router'
import { isMobile } from 'react-device-detect'

import { Avatar } from '@campsite/ui/Avatar'
import { Button } from '@campsite/ui/Button'
import { ArrowUpIcon } from '@campsite/ui/Icons'
import { Link } from '@campsite/ui/Link'
import { UIText } from '@campsite/ui/Text'
import { TextField } from '@campsite/ui/TextField'
import { cn } from '@campsite/ui/utils'

import { callChatOpenAtom } from '@/atoms/call'
import { getBorderRadiusClasses } from '@/components/Thread/Bubble'
import { useGetCallRoom } from '@/hooks/useGetCallRoom'

export const CALL_CHAT_SYSTEM_MESSAGE_TYPE = 'SYSTEM'

export function CallChat() {
  const callChatOpen = useAtomValue(callChatOpenAtom)

  if (!callChatOpen) return null

  return (
    <div className='absolute flex h-full w-full flex-col justify-end gap-2 rounded-lg bg-neutral-800 p-3 sm:static sm:min-w-[400px] sm:basis-[30%]'>
      <Messages />
      <Composer />
    </div>
  )
}

interface HMSMessageGroup {
  viewerIsSender: boolean
  isSystem: boolean
  sender?: string | undefined
  senderName?: string | undefined
  messages: HMSMessage[]
}

function groupMessagesBySender({ messages, localPeer }: { messages: HMSMessage[]; localPeer: HMSPeer | undefined }) {
  const groups: HMSMessageGroup[] = []

  messages.forEach((message) => {
    const lastGroup = groups[groups.length - 1]
    const lastMessage = lastGroup?.messages[lastGroup.messages.length - 1]
    const viewerIsSender = message.sender === localPeer?.id

    if (message.type === CALL_CHAT_SYSTEM_MESSAGE_TYPE) {
      return groups.push({ viewerIsSender: false, isSystem: true, messages: [message] })
    }

    if (lastMessage?.sender === message.sender && lastMessage?.type !== CALL_CHAT_SYSTEM_MESSAGE_TYPE) {
      lastGroup.messages.push(message)
    } else {
      groups.push({
        viewerIsSender,
        isSystem: false,
        sender: message.sender,
        senderName: message.senderName,
        messages: [message]
      })
    }
  })

  return groups
}

function Messages() {
  const messages = useHMSStore(selectHMSMessages)
  const localPeer = useHMSStore(selectLocalPeer)
  const groups = useMemo(() => groupMessagesBySender({ messages, localPeer }), [messages, localPeer])
  const containerRef = useRef<HTMLDivElement>(null)
  const lastMessageId = messages.at(messages.length - 1)?.id
  const callChatOpen = useAtomValue(callChatOpenAtom)
  const hmsActions = useHMSActions()

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
  }, [lastMessageId])

  useEffect(() => {
    if (callChatOpen) hmsActions.setMessageRead(true)
  }, [lastMessageId, callChatOpen, hmsActions])

  return (
    <div className='scrollbar-hide flex h-full flex-col justify-between gap-5 overflow-y-scroll' ref={containerRef}>
      <div className='rounded-lg bg-neutral-700 p-3'>
        <UIText size='text-sm' secondary>
          Chat messages will be automatically deleted after the call ends.
        </UIText>
      </div>
      <div className='flex flex-col gap-3'>
        {groups.map((group) => {
          if (group.isSystem) {
            return <SystemMessages key={group.messages[0].id} messages={group.messages} />
          }

          if (group.viewerIsSender) {
            return <ViewerMessages key={group.messages[0].id} messages={group.messages} />
          } else {
            return <OtherMessages key={group.messages[0].id} group={group} />
          }
        })}
      </div>
    </div>
  )
}

function SystemMessages({ messages }: { messages: HMSMessage[] }) {
  return (
    <div className='flex w-full flex-col p-1 text-center'>
      {messages.map((message) => (
        <UIText key={message.id} size='text-xs' tertiary>
          {message.message}
        </UIText>
      ))}
    </div>
  )
}

function ViewerMessages({ messages }: { messages: HMSMessage[] }) {
  return (
    <div className='flex w-full flex-col gap-0.5 self-end'>
      {messages.map((message) => (
        <Bubble key={message.id} message={message} position={messagePosition(message, messages)} />
      ))}
    </div>
  )
}

function messagePosition(message: HMSMessage, messages: HMSMessage[]) {
  return messages.length === 1
    ? 'only'
    : message.id === messages[0].id
      ? 'first'
      : message.id === messages[messages.length - 1].id
        ? 'last'
        : 'middle'
}

function OtherMessages({ group }: { group: HMSMessageGroup }) {
  const router = useRouter()
  const { data: callRoom } = useGetCallRoom({ callRoomId: router.query.callRoomId as string })
  const user = callRoom?.peers.find((peer) => peer.remote_peer_id === group.sender)?.member.user

  return (
    <div className='grid grid-cols-[36px_1fr] gap-1'>
      <UIText size='text-xs' className='col-start-2 ml-3' tertiary>
        {group.senderName}
      </UIText>
      <Avatar urls={user?.avatar_urls} size='base' />
      <div className='flex flex-col gap-1'>
        {group.messages.map((message) => (
          <Bubble key={message.id} message={message} position={messagePosition(message, group.messages)} />
        ))}
      </div>
    </div>
  )
}

interface BubbleProps {
  message: HMSMessage
  position: 'first' | 'middle' | 'last' | 'only'
}

function Bubble({ message, position }: BubbleProps) {
  const localPeer = useHMSStore(selectLocalPeer)
  const viewerIsSender = message.sender === localPeer?.id
  const roundedClasses = getBorderRadiusClasses(position, viewerIsSender)

  function renderLink({ attributes, content }: { attributes: any; content: any }) {
    const { class: className, ...rest } = attributes

    return (
      <Link className={className} {...rest} forceInternalLinksBlank>
        {content}
      </Link>
    )
  }

  return (
    <div
      className={cn('flex flex-col', {
        'items-end': viewerIsSender,
        'items-start': !viewerIsSender
      })}
    >
      <div
        className={cn(
          'chat-prose relative flex select-text flex-col whitespace-pre-wrap break-words px-3.5 py-2 text-sm lg:px-3',
          roundedClasses,
          {
            'bg-quaternary text-primary': !viewerIsSender,
            'bg-blue-500 text-white': viewerIsSender
          }
        )}
      >
        <Linkify
          options={{
            render: renderLink,
            className: '!underline',
            rel: 'noopener noreferrer nofollow',
            target: '_blank'
          }}
          as='p'
        >
          {message.message}
        </Linkify>
      </div>
    </div>
  )
}

function Composer() {
  const [message, setMessage] = useState('')
  const hmsActions = useHMSActions()

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const textField = e.currentTarget.elements[0] as HTMLTextAreaElement

    sendMessage(textField)
  }

  function sendMessage(textField: HTMLTextAreaElement) {
    if (!textField.value.trim()) return
    hmsActions.sendBroadcastMessage(textField.value)
    setMessage('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e.currentTarget)
    }
  }

  return (
    <form className='relative w-full' onSubmit={handleSubmit}>
      <TextField
        value={message}
        onChange={(value) => setMessage(value)}
        onKeyDown={handleKeyDown}
        multiline
        placeholder='Chat...'
        autoFocus={!isMobile}
        additionalClasses='dark:bg-neutral-700 border-0 focus:outline-none focus:ring-0 rounded-[18px] py-2 pl-3 pr-12'
      />
      <div className='absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center'>
        <Button
          round
          variant='plain'
          type='submit'
          iconOnly={<ArrowUpIcon size={18} color='black' strokeWidth='2.5' />}
          accessibilityLabel='Send'
          className='h-6 w-6 dark:bg-neutral-500 dark:hover:bg-neutral-400 dark:disabled:bg-neutral-500 dark:disabled:hover:bg-neutral-500'
          disabled={!message.trim()}
          tooltip='Send'
          tooltipShortcut='enter'
          onMouseDown={(e) => e.preventDefault()}
        />
      </div>
    </form>
  )
}
