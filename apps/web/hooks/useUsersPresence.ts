import { useCallback, useEffect, useState } from 'react'
import { Channel, Members, PresenceChannel } from 'pusher-js'

import { usePusher } from '@/contexts/pusher'

import { useBindChannelEvent } from './useBindChannelEvent'

type PusherMember = {
  id: string
}

type Props = {
  channelName: string | null | undefined
  setUserIds: (userIds: Set<string> | ((previous: Set<string>) => Set<string>)) => void
}

export function useUsersPresence({ channelName, setUserIds }: Props) {
  const pusher = usePusher()
  const [channel, setChannel] = useState<PresenceChannel | null>(null)

  const updateMembers = useCallback(
    (members: Members) => {
      const newUserIds = new Set<string>()

      members.each((member: PusherMember) => newUserIds.add(member.id))
      setUserIds(newUserIds)
    },
    [setUserIds]
  )

  const removeMember = useCallback(
    ({ id }: PusherMember) => {
      setUserIds((prev) => {
        prev.delete(id)
        return new Set(prev)
      })
    },
    [setUserIds]
  )

  useEffect(() => {
    if (pusher && channelName && (!channel || channel.name !== channelName)) {
      const subscribedChannel = pusher.subscribe(channelName)

      if (isPresenceChannel(subscribedChannel)) {
        setChannel(subscribedChannel)
        updateMembers(subscribedChannel.members)
      }
    }

    return () => {
      if (!channel || !channelName) return
      pusher?.unsubscribe(channelName)
      setChannel(null)
      setUserIds(new Set())
    }
  }, [channel, channelName, pusher, setUserIds, updateMembers])

  const addMember = useCallback(
    ({ id }: PusherMember) => {
      setUserIds((prev) => new Set(prev.add(id)))
    },
    [setUserIds]
  )

  useBindChannelEvent(channel, 'pusher:subscription_succeeded', updateMembers)
  useBindChannelEvent(channel, 'pusher:member_added', addMember)
  useBindChannelEvent(channel, 'pusher:member_removed', removeMember)
}

function isPresenceChannel(channel: Channel): channel is PresenceChannel {
  return channel && 'members' in channel
}
