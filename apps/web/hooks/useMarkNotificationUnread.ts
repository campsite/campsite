import { useMutation, useQueryClient } from '@tanstack/react-query'

import { PublicOrganization } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

import { optimisticMarkNotificationRead } from './useMarkNotificationRead'

export function useMarkNotificationUnread({ organization }: { organization?: PublicOrganization } = {}) {
  const { scope } = useScope()
  const orgSlug = organization?.slug || `${scope}`
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.organizations.deleteMembersMeNotificationsRead().request(orgSlug, id),
    onMutate: async (id) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: apiClient.users.getMeNotificationsUnreadAllCount().requestKey() }),
        optimisticMarkNotificationRead(id, queryClient, false)
      ])
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: apiClient.users.getMeNotificationsUnreadAllCount().requestKey() })
    }
  })
}
