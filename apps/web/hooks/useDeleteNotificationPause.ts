import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'
import { setNormalizedData } from '@/utils/queryNormalization'

const getMe = apiClient.users.getMe()
const getSyncMembers = apiClient.organizations.getSyncMembers()

export function useDeleteNotificationPause() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()
  const { data: currentUser } = useGetCurrentUser()

  return useMutation({
    mutationFn: () => apiClient.users.deleteMeNotificationPause().request(),
    onMutate: () => {
      setTypedQueryData(queryClient, getMe.requestKey(), (old) => {
        if (!old) return old
        return { ...old, notifications_paused: false }
      })

      if (!currentUser?.id) return

      setTypedQueryData(queryClient, getSyncMembers.requestKey(`${scope}`), (old) => {
        if (!old) return old

        return old.map((member) => {
          if (member.user.id === currentUser.id) {
            return { ...member, notifications_paused: false }
          }

          return member
        })
      })

      setNormalizedData({
        queryNormalizer,
        type: 'user',
        id: currentUser.id,
        update: () => ({
          notifications_paused: false
        })
      })
    }
  })
}
