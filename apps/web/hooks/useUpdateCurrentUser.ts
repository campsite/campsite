import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { UsersMePatchRequest } from '@campsite/types'

import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

export function useUpdateCurrentUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UsersMePatchRequest) => apiClient.users.patchMe().request(data),
    onSuccess: (data) => {
      setTypedQueryData(queryClient, apiClient.users.getMe().requestKey(), data)
      toast('Profile updated')
    },
    onError: apiErrorToast
  })
}
