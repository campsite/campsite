import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

type RemoveProps = {
  id: string
}

const query = apiClient.organizations.putMembersReactivate()

export function useReactivateOrganizationMember() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RemoveProps) => query.request(`${scope}`, data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getMembers().baseKey })

      // always invalidate synced members
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getSyncMembers().baseKey })

      toast(`Team member reactivated`)
    },
    onError: apiErrorToast
  })
}
