import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugOauthApplicationsIdPutRequest } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

const getOauthApplication = apiClient.organizations.getOauthApplicationsById()

export function useUpdateOauthApplication({ id }: { id?: string }) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugOauthApplicationsIdPutRequest) =>
      apiClient.organizations.putOauthApplicationsById().request(`${scope}`, `${id}`, data),
    onSuccess: (data) => {
      setTypedQueryData(queryClient, getOauthApplication.requestKey(`${scope}`, `${id}`), (oldData) => {
        if (!oldData) return oldData

        return { ...oldData, ...data }
      })

      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getOauthApplications().requestKey(`${scope}`) })
    }
  })
}
