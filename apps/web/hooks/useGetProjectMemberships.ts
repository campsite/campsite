import { Updater, useQuery, useQueryClient } from '@tanstack/react-query'
import { CookieValueTypes } from 'cookies-next'

import { GetProjectMembershipsData, ProjectMembership } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

const getProjectMemberships = apiClient.organizations.getProjectMemberships()
const getProjectsByProjectId = apiClient.organizations.getProjectsByProjectId()

export function setProjectMembershipsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  scope: CookieValueTypes,
  updater: Updater<GetProjectMembershipsData | undefined, GetProjectMembershipsData | undefined>
): GetProjectMembershipsData | undefined {
  return setTypedQueryData(queryClient, getProjectMemberships.requestKey(`${scope}`), updater)
}

export function updateProjectMembershipByProjectId(
  queryClient: ReturnType<typeof useQueryClient>,
  scope: unknown,
  projectId: string,
  attributes: Partial<ProjectMembership>
): GetProjectMembershipsData | undefined {
  return setTypedQueryData(queryClient, getProjectMemberships.requestKey(`${scope}`), (old) => {
    if (!old) return old

    return old.map((projectMembership) => {
      if (projectId === projectMembership.project.id) {
        return {
          ...projectMembership,
          ...attributes
        }
      }
      return projectMembership
    })
  })
}

type Props = {
  enabled?: boolean
}

export function useGetProjectMemberships({ enabled = true }: Props = {}) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: getProjectMemberships.requestKey(`${scope}`),
    queryFn: async () => {
      const results = await getProjectMemberships.request(`${scope}`)

      results.forEach((membership) => {
        setTypedQueryData(
          queryClient,
          getProjectsByProjectId.requestKey(`${scope}`, membership.project.id),
          membership.project
        )
      })

      return results
    },
    enabled
  })
}
