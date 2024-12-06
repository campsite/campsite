import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient } from '@/utils/queryClient'

import { updateProjectMembershipByProjectId } from './useGetProjectMemberships'

const query = apiClient.organizations.patchProjectsArchive()

export function useArchiveProject() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => query.request(`${scope}`, id),
    onSuccess: (project) => {
      toast('Channel archived')

      // Revalidate the list of projects
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getProjects().baseKey })
      // Revalidate the project that was archived
      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getProjectsByProjectId().requestKey(`${scope}`, project.id)
      })

      updateProjectMembershipByProjectId(queryClient, scope, project.id, { project })
    },
    onError: apiErrorToast
  })
}
