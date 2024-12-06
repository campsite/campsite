import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate } from '@/utils/queryNormalization'

import { useUpdateBadgeCount } from './useGetUnreadNotificationsCount'

const deleteThreadsReads = apiClient.organizations.deleteThreadsReads()
const getMeNotificationsUnreadAllCount = apiClient.users.getMeNotificationsUnreadAllCount()

type Props = {
  threadId: string
}

export function useMarkThreadUnread() {
  const queryClient = useQueryClient()
  const { scope } = useScope()
  const updateBadgeCount = useUpdateBadgeCount()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ threadId }: Props) => deleteThreadsReads.request(`${scope}`, threadId),
    onMutate: async (vars) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'thread',
        id: vars.threadId,
        update: { unread_count: 1, manually_marked_unread: true }
      })
    },
    onSuccess: async (notification_counts) => {
      if (notification_counts) {
        await queryClient.cancelQueries({ queryKey: getMeNotificationsUnreadAllCount.requestKey() })
        setTypedQueryData(queryClient, getMeNotificationsUnreadAllCount.requestKey(), notification_counts)
        updateBadgeCount(notification_counts)
      }
    },
    onError: apiErrorToast
  })
}
