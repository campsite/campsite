import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import Router from 'next/router'

import { Notification } from '@campsite/types'

import { useInboxSelectedItemId, useInboxSetSelection } from '@/components/InboxItems/hooks/useInboxSelectedItemId'
import { useAreBrowserNotificationsEnabled } from '@/hooks/useAreBrowserNotificationsEnabled'
import { useBindCurrentUserEventOnceInDesktopApp } from '@/hooks/useBindCurrentUserEventOnceInDesktopApp'
import { useCreateDesktopOrBrowserNotification } from '@/hooks/useCreateDesktopOrBrowserNotification'
import { getInboxItemRoutePath, getInboxItemSplitViewPath } from '@/utils/getInboxItemRoutePath'
import { apiClient } from '@/utils/queryClient'
import { throttle } from '@/utils/throttle'

import { useBindCurrentUserEvent } from './useBindCurrentUserEvent'
import { useMarkNotificationRead } from './useMarkNotificationRead'

type NotificationData = Notification & { skip_push: boolean }

export const useInboxItemSubscriptions = () => {
  const queryClient = useQueryClient()
  const { setInboxSelection } = useInboxSetSelection()
  const { selectedItemInboxId } = useInboxSelectedItemId()
  const { mutate: markNotificationRead } = useMarkNotificationRead()
  const areBrowserNotificationsEnabled = useAreBrowserNotificationsEnabled()
  const createDesktopOrBrowserNotification = useCreateDesktopOrBrowserNotification()

  const invalidateNotificationsAndCount = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: apiClient.organizations.getMembersMeNotifications().baseKey })
    queryClient.invalidateQueries({ queryKey: apiClient.organizations.getMembersMeArchivedNotifications().baseKey })
    queryClient.invalidateQueries({ queryKey: apiClient.users.getMeNotificationsUnreadAllCount().requestKey() })
  }, [queryClient])

  const invalidateFollowUps = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: apiClient.organizations.getFollowUps().baseKey })
  }, [queryClient])

  const markNotificationForCurrentPageRead = useCallback(
    (n: NotificationData) => {
      if (selectedItemInboxId === n.id || Router.query.inboxItemKey === n.inbox_key) {
        // mark the notification read to avoid flickering unread counts
        markNotificationRead(n.id, { onSuccess: invalidateNotificationsAndCount })
      } else {
        invalidateNotificationsAndCount()
      }
    },
    [selectedItemInboxId, markNotificationRead, invalidateNotificationsAndCount]
  )

  const triggerPushNotification = useCallback(
    (n: NotificationData) => {
      if (selectedItemInboxId === n.id) return
      if (Router.query.inboxItemKey === n.inbox_key) return
      if (n.subject.type === 'Reaction') return
      if (n.skip_push) return

      createDesktopOrBrowserNotification({
        title: n.summary,
        body: n.body_preview || undefined,
        tag: n.id,
        onClick: () => {
          if (n.is_inbox) {
            setInboxSelection(n.id)
            Router.push(getInboxItemSplitViewPath('updates', n))
          } else {
            Router.push(getInboxItemRoutePath(n))
          }
          markNotificationRead(n.id)
        }
      })
    },
    [createDesktopOrBrowserNotification, markNotificationRead, selectedItemInboxId, setInboxSelection]
  )

  useBindCurrentUserEvent('new-notification', markNotificationForCurrentPageRead)
  useBindCurrentUserEventOnceInDesktopApp({
    onceId: 'inbox-new-notification',
    eventName: 'new-notification',
    callback: throttle(triggerPushNotification, 10000)
  })
  useBindCurrentUserEvent('new-notification', throttle(triggerPushNotification, 10000), {
    enabled: areBrowserNotificationsEnabled
  })
  useBindCurrentUserEvent('notifications-stale', invalidateNotificationsAndCount)
  useBindCurrentUserEvent('follow-ups-stale', invalidateFollowUps)
}
