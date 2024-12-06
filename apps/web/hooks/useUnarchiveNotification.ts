import { useMutation, useQueryClient } from '@tanstack/react-query'

import { PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedInfiniteQueriesData } from '@/utils/queryClient'

export function useUnarchiveNotification({ organization }: { organization?: PublicOrganization } = {}) {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const orgSlug = organization?.slug || `${scope}`

  return useMutation({
    mutationFn: (id: string) => apiClient.organizations.deleteMembersMeNotificationsArchive().request(orgSlug, id),
    onMutate: async (id: string) => {
      const archivedNotificationsKey = apiClient.organizations.getMembersMeArchivedNotifications().baseKey

      await queryClient.cancelQueries({ queryKey: archivedNotificationsKey })

      setTypedInfiniteQueriesData(queryClient, archivedNotificationsKey, (old) => {
        if (!old) return
        return {
          ...old,
          pages: old.pages.map((page) => {
            return {
              ...page,
              data: page.data.filter((notification) => notification.id !== id)
            }
          })
        }
      })
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getMembersMeNotifications().baseKey
      })
      queryClient.invalidateQueries({
        queryKey: apiClient.users.getMeNotificationsUnreadAllCount().requestKey()
      })
    },
    onError() {
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getMembersMeArchivedNotifications().baseKey
      })
    }
  })
}
