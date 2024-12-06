import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import { MessageThread, PusherInvalidateMessage } from '@campsite/types'

import { useAreBrowserNotificationsEnabled } from '@/hooks/useAreBrowserNotificationsEnabled'
import { useBindCurrentUserEventOnceInDesktopApp } from '@/hooks/useBindCurrentUserEventOnceInDesktopApp'
import { useCreateDesktopOrBrowserNotification } from '@/hooks/useCreateDesktopOrBrowserNotification'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedInfiniteQueriesData, setTypedQueriesData } from '@/utils/queryClient'
import { setNormalizedData } from '@/utils/queryNormalization'

import { useAppFocused } from './useAppFocused'
import { useBindCurrentUserEvent } from './useBindCurrentUserEvent'

const getThreads = apiClient.organizations.getThreads()
const getThreadsById = apiClient.organizations.getThreadsById()
const getMessages = apiClient.organizations.getThreadsMessages()
const getFavorites = apiClient.organizations.getFavorites()

export const useChatSubscriptions = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()
  const isFocused = useAppFocused()
  const { data: currentUser } = useGetCurrentUser()
  const areBrowserNotificationsEnabled = useAreBrowserNotificationsEnabled()
  const createDesktopOrBrowserNotification = useCreateDesktopOrBrowserNotification()

  const invalidateThreadQueries = useCallback(
    (e: PusherInvalidateMessage, type: string) => {
      const { message_thread, message } = e
      const isNewMessageInFocusedThread =
        (type === 'new-message' && isFocused && router.query?.threadId === message_thread.id) ||
        router.query?.projectId === message_thread.project_id

      if (isNewMessageInFocusedThread) {
        message_thread.unread_count = 0
      } else {
        queryClient.invalidateQueries({ queryKey: getThreads.requestKey(message_thread.organization_slug) })

        if (message_thread.project_id && type === 'new-message') {
          setNormalizedData({
            queryNormalizer,
            type: 'project',
            id: message_thread.project_id,
            update: { unread_for_viewer: true }
          })
        }
      }

      // Update thread query
      setNormalizedData({ queryNormalizer, type: 'thread', id: message_thread.id, update: message_thread })

      // Update messages query
      if (type === 'new-message') {
        setTypedInfiniteQueriesData(
          queryClient,
          getMessages.requestKey({ orgSlug: message_thread.organization_slug, threadId: message_thread.id }),
          (old) => {
            if (!old?.pages.length) return old

            let hasMessage = false
            const pages = old.pages.map((page) => ({
              ...page,
              data: page.data.map((oldMessage) => {
                if (message.id === oldMessage.id) {
                  hasMessage = true
                  return { ...message, optimistic_id: oldMessage.optimistic_id }
                } else {
                  return oldMessage
                }
              })
            }))

            if (hasMessage) return { ...old, pages }

            return {
              ...old,
              pages: [
                {
                  ...old.pages[0],
                  data: [message, ...old.pages[0].data]
                },
                ...old.pages.slice(1)
              ]
            }
          }
        )
      } else {
        setTypedInfiniteQueriesData(
          queryClient,
          getMessages.requestKey({ orgSlug: message_thread.organization_slug, threadId: message_thread.id }),
          (old) => {
            if (!old) return
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data
                  .map((oldMessage) => {
                    if (message.id === oldMessage.id) {
                      return message
                    } else if (message.id === oldMessage.reply?.id) {
                      return {
                        ...oldMessage,
                        reply: {
                          ...oldMessage.reply,
                          content: message.content
                        }
                      }
                    } else {
                      return oldMessage
                    }
                  })
                  .filter((message) => message.discarded_at == null)
              }))
            }
          }
        )
      }

      // Update unread count
      if (!isNewMessageInFocusedThread) {
        queryClient.invalidateQueries({
          queryKey: apiClient.users.getMeNotificationsUnreadAllCount().requestKey()
        })
      }

      // update favorites
      setTypedQueriesData(queryClient, getFavorites.requestKey(message_thread.organization_slug), (old) => {
        if (!old) return old

        return old.map((favorite) => {
          if (favorite.message_thread?.id === message_thread.id) {
            return {
              ...favorite,
              message_thread: {
                ...favorite.message_thread,
                ...message_thread
              }
            }
          }
          return favorite
        })
      })
    },
    [isFocused, queryClient, queryNormalizer, router]
  )

  const hardInvalidateThreadQueries = useCallback(
    ({ message_thread_id, organization_slug }: { message_thread_id: string; organization_slug: string }) => {
      queryClient.invalidateQueries({ queryKey: getThreads.requestKey(organization_slug) })
      queryClient.invalidateQueries({ queryKey: getFavorites.requestKey(organization_slug) })
      queryClient.invalidateQueries({ queryKey: getThreadsById.requestKey(organization_slug, message_thread_id) })
      queryClient.invalidateQueries({
        queryKey: getMessages.requestKey({ orgSlug: organization_slug, threadId: message_thread_id })
      })
    },
    [queryClient]
  )

  const updateThread = useCallback(
    (newData: Partial<MessageThread> & Required<Pick<MessageThread, 'organization_slug' | 'id'>>) => {
      setNormalizedData({ queryNormalizer, type: 'thread', id: newData.id, update: newData })
    },
    [queryNormalizer]
  )

  const optimisticallyMarkThreadRead = useCallback(
    (threadId: string) =>
      setNormalizedData({
        queryNormalizer,
        type: 'thread',
        id: threadId,
        update: { unread_count: 0, manually_marked_unread: false }
      }),
    [queryNormalizer]
  )

  const optimisticallyMarkThreadUnread = useCallback(
    (threadId: string) =>
      setNormalizedData({
        queryNormalizer,
        type: 'thread',
        id: threadId,
        update: { unread_count: 1, manually_marked_unread: true }
      }),
    [queryNormalizer]
  )

  const createMessageNotification = useCallback(
    (e: PusherInvalidateMessage) => {
      const { message_thread, message, skip_push, push_body } = e

      if (message.sender.user.id === currentUser?.id || skip_push) return

      createDesktopOrBrowserNotification({
        title: message_thread.title,
        body: push_body || message_thread.latest_message_truncated || undefined,
        tag: message.id,
        onClick: () => {
          router.push(message_thread.path, undefined, {
            scroll: false
          })
        }
      })
    },
    [createDesktopOrBrowserNotification, currentUser?.id, router]
  )

  const createMessageNotificationUnlessFocused = useCallback(
    (e: PusherInvalidateMessage) => {
      const { message_thread } = e

      if (isFocused && router.query?.threadId === message_thread.id) return
      createMessageNotification(e)
    },
    [createMessageNotification, isFocused, router.query?.threadId]
  )

  const removeThreadQueries = useCallback(
    ({ message_thread_id, organization_slug }: { message_thread_id: string; organization_slug: string }) => {
      queryClient.invalidateQueries({ queryKey: getThreads.requestKey(organization_slug) })
      queryClient.invalidateQueries({ queryKey: getFavorites.requestKey(organization_slug) })
      queryClient.removeQueries({ queryKey: getThreadsById.requestKey(organization_slug, message_thread_id) })
      queryClient.removeQueries({
        queryKey: getMessages.requestKey({ orgSlug: organization_slug, threadId: message_thread_id })
      })
    },
    [queryClient]
  )

  useBindCurrentUserEvent('new-message', invalidateThreadQueries)
  useBindCurrentUserEventOnceInDesktopApp({
    onceId: 'new-message-notification',
    eventName: 'new-message',
    callback: createMessageNotificationUnlessFocused
  })
  useBindCurrentUserEventOnceInDesktopApp({
    onceId: 'force-message-notification',
    eventName: 'force-message-notification',
    callback: createMessageNotification
  })
  useBindCurrentUserEvent('new-message', createMessageNotificationUnlessFocused, {
    enabled: areBrowserNotificationsEnabled
  })
  useBindCurrentUserEvent('force-message-notification', createMessageNotification, {
    enabled: areBrowserNotificationsEnabled
  })
  useBindCurrentUserEvent('discard-message', invalidateThreadQueries)
  useBindCurrentUserEvent('update-message', invalidateThreadQueries)
  useBindCurrentUserEvent('invalidate-thread', hardInvalidateThreadQueries)
  useBindCurrentUserEvent('thread-marked-read', optimisticallyMarkThreadRead)
  useBindCurrentUserEvent('thread-marked-unread', optimisticallyMarkThreadUnread)
  useBindCurrentUserEvent('thread-updated', updateThread)
  useBindCurrentUserEvent('thread-destroyed', removeThreadQueries)
}
