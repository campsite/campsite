import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugMembersMemberUsernameProjectMembershipListPutRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

const getMembersProjectMemberships = apiClient.organizations.getMembersProjectMemberships()

export function useUpdateMemberProjectMemberships({ memberUsername }: { memberUsername: string }) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugMembersMemberUsernameProjectMembershipListPutRequest) =>
      apiClient.organizations.putMembersProjectMembershipList().request(`${scope}`, memberUsername, data),
    onSuccess: (data, { add_project_ids, remove_project_ids }) => {
      setTypedQueryData(queryClient, getMembersProjectMemberships.requestKey(`${scope}`, memberUsername), data)

      const projectIds = [...add_project_ids, ...remove_project_ids]

      projectIds.forEach((projectId) => {
        queryClient.invalidateQueries({
          queryKey: apiClient.organizations.getProjectsMembers().requestKey({ orgSlug: `${scope}`, projectId })
        })
      })
    }
  })
}
