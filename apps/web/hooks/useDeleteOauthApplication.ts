import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueriesData } from '@/utils/queryClient'

const getOauthApplications = apiClient.organizations.getOauthApplications()
const deleteOauthApplicationsById = apiClient.organizations.deleteOauthApplicationsById()

export function useDeleteOauthApplication() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteOauthApplicationsById.request(`${scope}`, id),
    onSuccess: async (_, id: string) => {
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getProjects().baseKey })

      setTypedQueriesData(queryClient, getOauthApplications.requestKey(`${scope}`), (old) => {
        if (!old) return
        return [...old.filter((app) => app.id !== id)]
      })
    }
  })
}
