import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'
import { createNormalizedOptimisticUpdate, getNormalizedData } from '@/utils/queryNormalization'

import { useUpdateBadgeCount } from './useGetUnreadNotificationsCount'

const postThreadsReads = apiClient.organizations.postThreadsReads()
const getMeNotificationsUnreadAllCount = apiClient.users.getMeNotificationsUnreadAllCount()
const getProject = apiClient.organizations.getProjectsByProjectId()

interface Props {
  threadId: string
}

export function useMarkThreadRead() {
  const queryClient = useQueryClient()
  const { scope } = useScope()
  const updateBadgeCount = useUpdateBadgeCount()
  const queryNormalizer = useQueryNormalizer()

  return useMutation({
    mutationFn: ({ threadId }: Props) => postThreadsReads.request(`${scope}`, threadId),
    onMutate: async (vars) => {
      return createNormalizedOptimisticUpdate({
        queryNormalizer,
        type: 'thread',
        id: vars.threadId,
        update: { unread_count: 0, manually_marked_unread: false }
      })
    },
    onSuccess: async (notification_counts, { threadId }) => {
      if (notification_counts) {
        await queryClient.cancelQueries({ queryKey: getMeNotificationsUnreadAllCount.requestKey() })
        setTypedQueryData(queryClient, getMeNotificationsUnreadAllCount.requestKey(), notification_counts)
        updateBadgeCount(notification_counts)
      }

      const thread = getNormalizedData({ queryNormalizer, type: 'thread', id: threadId })

      if (thread?.project_id) {
        queryClient.invalidateQueries({ queryKey: getProject.requestKey(`${scope}`, thread.project_id) })
      }
    },
    onError: apiErrorToast
  })
}
