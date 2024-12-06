import { useMutation, useQueryClient } from '@tanstack/react-query'

import { PublicOrganization } from '@campsite/types'

import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

const getGoogleCalendarIntegration = apiClient.integrations.getIntegrationsGoogleCalendarIntegration()

export function useUpdateGoogleCalendarOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (org: PublicOrganization) =>
      apiClient.integrations.putIntegrationsGoogleCalendarEventsOrganization().request({ organization_id: org.id }),
    onMutate: (organization) => {
      setTypedQueriesData(queryClient, getGoogleCalendarIntegration.requestKey(), (old) => {
        if (!old) return old
        return { ...old, organization }
      })
    }
  })
}
