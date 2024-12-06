import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

export function useSendEmailConfirmation() {
  return useMutation({
    mutationFn: () => apiClient.users.postMeSendEmailConfirmation().request(),
    onSuccess: () => {
      toast('Email has been sent.')
    },
    onError: apiErrorToast
  })
}
