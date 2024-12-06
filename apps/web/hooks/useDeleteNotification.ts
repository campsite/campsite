import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Notification, OrganizationNotificationDeleteRequest, PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedInfiniteQueriesData } from '@/utils/queryClient'

interface DeleteNotificationMutationVariables {
  notification: Notification
  archiveBy: OrganizationNotificationDeleteRequest['archive_by']
}

export function useDeleteNotification({ organization }: { organization?: PublicOrganization } = {}) {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const orgSlug = organization?.slug || `${scope}`

  return useMutation({
    mutationFn: ({ notification, archiveBy }: DeleteNotificationMutationVariables) =>
      apiClient.organizations
        .deleteMembersMeNotificationsById()
        .request(orgSlug, notification.id, { archive_by: archiveBy }),
    onMutate: async ({ notification, archiveBy }: DeleteNotificationMutationVariables) => {
      const notificationsKey = apiClient.organizations.getMembersMeNotifications().baseKey

      await queryClient.cancelQueries({ queryKey: notificationsKey })

      setTypedInfiniteQueriesData(queryClient, notificationsKey, (old) => {
        if (!old) return
        return {
          ...old,
          pages: old.pages.map((page) => {
            return {
              ...page,
              data: page.data.filter((item) => {
                if (archiveBy === 'id') return item.id !== notification.id
                return item.inbox_key !== notification.inbox_key
              })
            }
          })
        }
      })
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: apiClient.users.getMeNotificationsUnreadAllCount().requestKey() })
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getMembersMeArchivedNotifications().baseKey
      })
    },
    onError() {
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getMembersMeNotifications().baseKey })
    }
  })
}
