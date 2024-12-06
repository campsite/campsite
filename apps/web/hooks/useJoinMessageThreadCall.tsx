import { useCallback } from 'react'

import { MessageThread } from '@campsite/types'
import { useIsDesktopApp } from '@campsite/ui/hooks'
import { desktopJoinCall } from '@campsite/ui/Link'

import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

type Props = {
  thread?: MessageThread
}

export function useJoinMessageThreadCall({ thread }: Props) {
  const { data: currentUser } = useGetCurrentUser()
  const singleChatWithDeactivatedMember =
    thread?.other_members.length === 1 && !!thread?.other_members.at(0)?.deactivated
  const canJoin =
    currentUser && !currentUser.on_call && !singleChatWithDeactivatedMember && !!thread?.remote_call_room_id
  const isDesktopApp = useIsDesktopApp()

  const join = useCallback(() => {
    if (!thread?.call_room_url) return
    if (isDesktopApp) {
      desktopJoinCall(thread.call_room_url)
    } else {
      window.open(thread.call_room_url)
    }
  }, [isDesktopApp, thread?.call_room_url])

  return { joinCall: join, canJoin, onCall: !!currentUser?.on_call }
}
