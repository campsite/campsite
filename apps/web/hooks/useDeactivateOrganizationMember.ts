import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

type RemoveProps = {
  id: string
}

const query = apiClient.organizations.deleteMembersById()

export function useDeactivateOrganizationMember(orgSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RemoveProps) => query.request(orgSlug, data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getMembers().requestKey({ orgSlug }) })

      // always invalidate synced members
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getSyncMembers().requestKey(orgSlug) })

      toast(`Deactivated team member`)
    },
    onError: apiErrorToast
  })
}
