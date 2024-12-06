import { useMutation, useQueryClient } from '@tanstack/react-query'

import { usePusherSocketIdHeader } from '@/contexts/pusher'
import { useScope } from '@/contexts/scope'
import { apiClient, setTypedInfiniteQueriesData, setTypedQueryData } from '@/utils/queryClient'

import { useUpdateBadgeCount } from './useGetUnreadNotificationsCount'

type Props = {
  noteId: string
}

export function useCreateNoteView() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const updateBadgeCount = useUpdateBadgeCount()
  const pusherSocketIdHeader = usePusherSocketIdHeader()

  return useMutation({
    mutationFn: ({ noteId }: Props) =>
      apiClient.organizations.postNotesViews().request(`${scope}`, noteId, { headers: pusherSocketIdHeader }),
    onSuccess: async ({ views, notification_counts }, { noteId }) => {
      setTypedQueryData(queryClient, apiClient.organizations.getNotesViews().requestKey(`${scope}`, noteId), views)

      setTypedInfiniteQueriesData(queryClient, apiClient.organizations.getMembersMeNotifications().baseKey, (old) => {
        if (!old) return
        return {
          ...old,
          pages: old.pages.map((page) => {
            return {
              ...page,
              data: page.data.map((notification) => {
                if (notification.target.id === noteId && notification.target.type === 'Note') {
                  return {
                    ...notification,
                    read: true
                  }
                } else {
                  return notification
                }
              })
            }
          })
        }
      })

      if (notification_counts) {
        const unreadCountKey = apiClient.users.getMeNotificationsUnreadAllCount().requestKey()

        await queryClient.cancelQueries({ queryKey: unreadCountKey })
        setTypedQueryData(queryClient, unreadCountKey, notification_counts)
        updateBadgeCount(notification_counts)
      }
    }
  })
}
