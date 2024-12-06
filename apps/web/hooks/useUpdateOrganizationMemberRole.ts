import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

type UpdateMemberRoleProps = {
  id: string
  role: string
}

const query = apiClient.organizations.putMembersById()

export function useUpdateOrganizationMemberRole() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateMemberRoleProps) => query.request(`${scope}`, data.id, { role: data.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getMembers().baseKey })
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getByOrgSlug().baseKey })

      // always invalidate synced members
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getSyncMembers().requestKey(`${scope}`) })

      toast(`Role updated`)
    },
    onError: apiErrorToast
  })
}
