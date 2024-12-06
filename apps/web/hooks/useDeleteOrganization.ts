import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { WEB_URL } from '@campsite/config'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, getTypedQueryData } from '@/utils/queryClient'

export function useDeleteOrganization() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.organizations.deleteByOrgSlug().request(`${scope}`),
    onSuccess: () => {
      toast('Organization deleted')

      const organizationsKey = apiClient.organizationMemberships.getOrganizationMemberships().requestKey()
      const queryData = getTypedQueryData(queryClient, organizationsKey)
      const nextOrganization = queryData?.find((m) => m.organization.slug !== scope)?.organization

      // Perform a hard refresh to avoid an "unauthorized" UI state from queries revalidating while waiting for navigation
      setTimeout(() => {
        window.location.href = WEB_URL + `/${nextOrganization?.slug || 'new'}`
      }, 1500)
    },
    onError: apiErrorToast
  })
}
