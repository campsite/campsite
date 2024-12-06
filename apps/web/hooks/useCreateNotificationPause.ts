import { useMutation, useQueryClient } from '@tanstack/react-query'

import { UsersMeNotificationPausePostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'
import { setNormalizedData } from '@/utils/queryNormalization'

const getMe = apiClient.users.getMe()
const getSyncMembers = apiClient.organizations.getSyncMembers()

export function useCreateNotificationPause() {
  const { scope } = useScope()
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()
  const { data: currentUser } = useGetCurrentUser()

  return useMutation({
    mutationFn: (data: UsersMeNotificationPausePostRequest) => apiClient.users.postMeNotificationPause().request(data),
    onMutate: () => {
      setTypedQueryData(queryClient, getMe.requestKey(), (old) => {
        if (!old) return old
        return { ...old, notifications_paused: true }
      })

      if (!currentUser?.id) return

      setTypedQueryData(queryClient, getSyncMembers.requestKey(`${scope}`), (old) => {
        if (!old) return old

        return old.map((member) => {
          if (member.user.id === currentUser.id) {
            return { ...member, notifications_paused: true }
          }

          return member
        })
      })

      setNormalizedData({
        queryNormalizer,
        type: 'user',
        id: currentUser.id,
        update: { notifications_paused: true }
      })
    }
  })
}
