import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { OrganizationNotificationMarkAllReadPostRequest, PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedInfiniteQueriesData } from '@/utils/queryClient'

const getMembersMeNotifications = apiClient.organizations.getMembersMeNotifications()

type Options = { organization?: PublicOrganization } | void

export function useMarkAllNotificationsRead({ organization }: Options = {}) {
  const { scope } = useScope()
  const orgSlug = organization?.slug || `${scope}`
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationNotificationMarkAllReadPostRequest | void) =>
      apiClient.organizations.postMembersMeNotificationsMarkAllRead().request(orgSlug, data || {}),
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: getMembersMeNotifications.baseKey }),
        queryClient.cancelQueries({ queryKey: apiClient.users.getMeNotificationsUnreadAllCount().requestKey() })
      ])

      setTypedInfiniteQueriesData(queryClient, getMembersMeNotifications.baseKey, (old) => {
        if (!old) return

        return {
          ...old,
          pages: old.pages.map((page) => {
            return {
              ...page,
              data: page.data.map((notification) => ({
                ...notification,
                read: true
              }))
            }
          })
        }
      })
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: apiClient.users.getMeNotificationsUnreadAllCount().requestKey() })
      queryClient.invalidateQueries({ queryKey: getMembersMeNotifications.baseKey })
      toast('All notifications marked read')
    }
  })
}
