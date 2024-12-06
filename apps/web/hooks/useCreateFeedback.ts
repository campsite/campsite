import { useMutation } from '@tanstack/react-query'

import { OrganizationFeedbacksPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useCreateFeedback() {
  const { scope } = useScope()

  return useMutation({
    mutationFn: (data: OrganizationFeedbacksPostRequest) =>
      apiClient.organizations.postFeedback().request(`${scope}`, { ...data })
  })
}
