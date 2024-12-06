import { useMutation, useQueryClient } from '@tanstack/react-query'

import { PublicOrganization } from '@campsite/types'

import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

const getCalDotComOrganization = apiClient.integrations.getIntegrationsCalDotComIntegration()

export function useUpdateCalDotComOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (org: PublicOrganization) =>
      apiClient.integrations.putIntegrationsCalDotComOrganization().request({ organization_id: org.id }),
    onMutate: (organization) => {
      setTypedQueriesData(queryClient, getCalDotComOrganization.requestKey(), (old) => {
        if (!old) return old
        return { ...old, organization }
      })
    }
  })
}
