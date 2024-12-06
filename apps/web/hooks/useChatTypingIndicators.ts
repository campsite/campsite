import { useCallback, useEffect, useRef, useState } from 'react'
import { Channel } from 'pusher-js'

import { PusherInvalidateMessage, User } from '@campsite/types'

import { usePusher } from '@/contexts/pusher'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

import { useBindChannelEvent } from './useBindChannelEvent'
import { useBindCurrentUserEvent } from './useBindCurrentUserEvent'

export function useThreadChannel(channelName?: string) {
  const pusher = usePusher()
  const [threadChannel, setThreadChannel] = useState<Channel | null>(null)

  useEffect(() => {
    if (!channelName || !pusher) return
    const channel = pusher.subscribe(channelName)

    setThreadChannel(channel)

    return () => {
      if (!channel) return
      pusher.unsubscribe(channelName)
      setThreadChannel(null)
    }
  }, [pusher, channelName])

  return threadChannel
}

interface UseChatTypingIndicatorOptions {
  threadId?: string
  channelName?: string
}

export function useChatTypingIndicator({ threadId, channelName }: UseChatTypingIndicatorOptions) {
  const { data: currentUser } = useGetCurrentUser()
  const [typers, setTypers] = useState<User[]>([])

  const userTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})

  const queueTypingIndicator = useCallback(
    (e: { user: User }) => {
      if (userTimeoutsRef.current[e.user.id]) {
        clearTimeout(userTimeoutsRef.current[e.user.id])
        delete userTimeoutsRef.current[e.user.id]
      }

      setTypers((users) => {
        if (e.user.id === currentUser?.id) return users
        if (users.some((user) => user.id === e.user.id)) return users

        return [...users, e.user]
      })

      userTimeoutsRef.current[e.user.id] = setTimeout(() => {
        setTypers((users) => users.filter((user) => user.id !== e.user.id))
      }, 1000)
    },
    [currentUser]
  )

  const removeTypingIndicator = useCallback(
    (e: PusherInvalidateMessage) => {
      if (e.message_thread.id !== threadId) return

      const messageUser = e.message.sender.user

      if (userTimeoutsRef.current[messageUser.id]) {
        clearTimeout(userTimeoutsRef.current[messageUser.id])
        delete userTimeoutsRef.current[messageUser.id]
      }

      setTypers((users) => users.filter((user) => user.id !== messageUser.id))
    },
    [threadId]
  )

  const threadChannel = useThreadChannel(channelName)

  useBindChannelEvent(threadChannel, 'client-typing', queueTypingIndicator)
  useBindCurrentUserEvent('new-message', removeTypingIndicator)

  return typers
}
