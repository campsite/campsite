import { useMutation } from '@tanstack/react-query'

import { InternalDesktopSessionPostRequest } from '@campsite/types'

import { apiClient } from '@/utils/queryClient'

export function useCreateDesktopSession() {
  return useMutation({
    mutationFn: (data: InternalDesktopSessionPostRequest) => apiClient.signIn.postSignInDesktop().request(data)
  })
}
