import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

import { OrganizationProjectMembersGetRequest } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

const query = apiClient.organizations.getProjectsMembers()

type Options = {
  projectId?: string
  organizationMembershipId?: string
  after?: string
  limit?: number
  roles?: OrganizationProjectMembersGetRequest['roles']
  excludeRoles?: OrganizationProjectMembersGetRequest['exclude_roles']
}

export function useGetProjectMembers({
  projectId,
  organizationMembershipId,
  after,
  limit,
  roles,
  excludeRoles
}: Options) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  const result = useInfiniteQuery({
    queryKey: query.requestKey({
      orgSlug: `${scope}`,
      projectId: `${projectId}`,
      organization_membership_id: organizationMembershipId,
      after,
      limit,
      roles,
      exclude_roles: excludeRoles
    }),
    queryFn: async ({ pageParam }) => {
      const results = await query.request({
        orgSlug: `${scope}`,
        projectId: `${projectId}`,
        organization_membership_id: organizationMembershipId,
        after: pageParam,
        limit,
        roles,
        exclude_roles: excludeRoles
      })

      results.data.forEach((member) => {
        setTypedQueryData(
          queryClient,
          apiClient.organizations.getMembersByUsername().requestKey(`${scope}`, member.user.username),
          member
        )
      })

      return results
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    enabled: !!scope && !!projectId
  })

  return {
    ...result,
    total: result.data?.pages?.slice(-1)?.[0]?.total_count
  }
}
