import { InfiniteData, QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'

import { NotificationPage, PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedInfiniteQueriesData } from '@/utils/queryClient'

const getMembersMeNotifications = apiClient.organizations.getMembersMeNotifications()
const getMembersMeArchivedNotifications = apiClient.organizations.getMembersMeArchivedNotifications()

export async function optimisticMarkNotificationRead(id: string, queryClient: QueryClient, read: boolean) {
  await queryClient.cancelQueries({ queryKey: getMembersMeNotifications.baseKey })
  await queryClient.cancelQueries({ queryKey: getMembersMeArchivedNotifications.baseKey })

  function updateNotificationInfiniteData(old: InfiniteData<NotificationPage> | undefined) {
    if (!old) return
    return {
      ...old,
      pages: old.pages.map((page) => {
        return {
          ...page,
          data: page.data.map((notification) => {
            if (notification.id === id) {
              return {
                ...notification,
                read
              }
            }

            return notification
          })
        }
      })
    }
  }

  setTypedInfiniteQueriesData(queryClient, getMembersMeNotifications.baseKey, updateNotificationInfiniteData)
  setTypedInfiniteQueriesData(queryClient, getMembersMeArchivedNotifications.baseKey, updateNotificationInfiniteData)
}

export function useMarkNotificationRead({ organization }: { organization?: PublicOrganization } = {}) {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const orgSlug = organization?.slug || `${scope}`

  return useMutation({
    mutationFn: (id: string) => apiClient.organizations.postMembersMeNotificationsRead().request(orgSlug, id),
    onMutate: async (id) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: apiClient.users.getMeNotificationsUnreadAllCount().requestKey() }),
        optimisticMarkNotificationRead(id, queryClient, true)
      ])
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: apiClient.users.getMeNotificationsUnreadAllCount().requestKey() })
    }
  })
}
