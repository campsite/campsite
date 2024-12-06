import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationNotificationDeleteAllPostRequest, PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedInfiniteQueriesData, setTypedQueryData } from '@/utils/queryClient'

type Options = { organization?: PublicOrganization } | void

export function useDeleteAllNotifications({ organization }: Options = {}) {
  const { scope } = useScope()
  const orgSlug = organization?.slug || `${scope}`
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationNotificationDeleteAllPostRequest) =>
      apiClient.organizations.postMembersMeNotificationsDeleteAll().request(orgSlug, data || {}),
    onMutate: async ({ read_only }) => {
      const notificationsKey = apiClient.organizations.getMembersMeNotifications().baseKey
      const unreadCountKey = apiClient.users.getMeNotificationsUnreadAllCount().requestKey()

      await Promise.all([
        queryClient.cancelQueries({ queryKey: notificationsKey }),
        queryClient.cancelQueries({ queryKey: unreadCountKey })
      ])

      setTypedInfiniteQueriesData(queryClient, notificationsKey, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => {
            return {
              ...page,
              data: read_only ? page.data.filter((n) => !n.read) : []
            }
          })
        }
      })

      if (read_only) {
        setTypedQueryData(queryClient, unreadCountKey, (old) => {
          if (!old) return old
          return {
            ...old,
            inbox: {
              ...old.inbox,
              [orgSlug]: 0
            }
          }
        })
      }
    }
  })
}
