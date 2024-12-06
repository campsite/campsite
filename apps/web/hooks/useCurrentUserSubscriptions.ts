import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'

import { CurrentUser } from '@campsite/types'

import { CallRoomInvitation, incomingCallRoomInvitationAtom } from '@/atoms/call'
import { useAreBrowserNotificationsEnabled } from '@/hooks/useAreBrowserNotificationsEnabled'
import { useBindCurrentUserEventOnceInDesktopApp } from '@/hooks/useBindCurrentUserEventOnceInDesktopApp'
import { useCreateDesktopOrBrowserNotification } from '@/hooks/useCreateDesktopOrBrowserNotification'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

import { useBindCurrentUserEvent } from './useBindCurrentUserEvent'

const getMe = apiClient.users.getMe()
const getFavorites = apiClient.organizations.getFavorites()

export const useCurrentUserSubscriptions = () => {
  const queryClient = useQueryClient()
  const setIncomingCallRoomInvitation = useSetAtom(incomingCallRoomInvitationAtom)
  const areBrowserNotificationsEnabled = useAreBrowserNotificationsEnabled()
  const createDesktopOrBrowserNotification = useCreateDesktopOrBrowserNotification()

  const updateCurrentUser = useCallback(
    ({ current_user }: { current_user: CurrentUser }) => {
      setTypedQueriesData(queryClient, getMe.requestKey(), current_user)
    },
    [queryClient]
  )

  const invalidateFavorites = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getFavorites.baseKey })
  }, [queryClient])

  const openIncomingCallInvitation = useCallback(
    (invitation: CallRoomInvitation) => {
      setIncomingCallRoomInvitation(invitation)
    },
    [setIncomingCallRoomInvitation]
  )

  const closeIncomingCallInvitation = useCallback(
    ({ call_room_id }: { call_room_id: string }) => {
      setIncomingCallRoomInvitation((prev) => (prev?.call_room_id === call_room_id ? undefined : prev))
    },
    [setIncomingCallRoomInvitation]
  )

  const createIncomingCallNotification = useCallback(
    (invitation: CallRoomInvitation) => {
      if (invitation.skip_push) return

      createDesktopOrBrowserNotification({
        title: `${invitation.creator_member.user.display_name} invited you to a call`,
        tag: invitation.call_room_id
      })
    },
    [createDesktopOrBrowserNotification]
  )

  const invalidateAccessTokens = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: apiClient.integrations.getIntegrationsCalDotComIntegration().baseKey })
    queryClient.invalidateQueries({
      queryKey: apiClient.integrations.getIntegrationsGoogleCalendarIntegration().baseKey
    })
  }, [queryClient])

  useBindCurrentUserEvent('current-user-stale', updateCurrentUser)
  useBindCurrentUserEvent('favorites-stale', invalidateFavorites)
  useBindCurrentUserEvent('incoming-call-room-invitation', openIncomingCallInvitation)
  useBindCurrentUserEvent('client-joined-call', closeIncomingCallInvitation)
  useBindCurrentUserEvent('client-declined-call', closeIncomingCallInvitation)
  useBindCurrentUserEvent('call-room-invitation-destroyed', closeIncomingCallInvitation)
  useBindCurrentUserEventOnceInDesktopApp({
    onceId: 'incoming-call-room-invitation-notification',
    eventName: 'incoming-call-room-invitation',
    callback: createIncomingCallNotification
  })
  useBindCurrentUserEvent('incoming-call-room-invitation', createIncomingCallNotification, {
    enabled: areBrowserNotificationsEnabled
  })
  useBindCurrentUserEvent('access-tokens-stale', invalidateAccessTokens)
}
