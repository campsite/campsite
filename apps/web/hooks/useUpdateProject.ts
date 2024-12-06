import { useMutation } from '@tanstack/react-query'

import { OrganizationsOrgSlugProjectsProjectIdPutRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.putProjectsByProjectId()

export function useUpdateProject(id: string) {
  const { scope } = useScope()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugProjectsProjectIdPutRequest) => query.request(`${scope}`, id, data),
    onError: apiErrorToast
  })
}
