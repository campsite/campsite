import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const getQuery = apiClient.organizations.getIntegrationsLinearInstallation()
const deleteQuery = apiClient.organizations.deleteIntegrationsLinearInstallation()

export function useDisconnectLinear() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteQuery.request(`${scope}`),
    onSuccess: () => {
      toast('Linear disconnected')
      queryClient.refetchQueries({
        queryKey: getQuery.requestKey(`${scope}`)
      })
    },
    onError: (error: any) => toast.error(error.message)
  })
}
