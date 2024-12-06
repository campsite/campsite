import { useMutation, useQueryClient } from '@tanstack/react-query'

import { OrganizationsOrgSlugProjectsPostRequest } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient, setTypedInfiniteQueriesData } from '@/utils/queryClient'

const postSpaces = apiClient.organizations.postProjects()
const getSpaces = apiClient.organizations.getProjects()
const getMemberships = apiClient.organizations.getProjectMemberships()

export function useCreateProject() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: OrganizationsOrgSlugProjectsPostRequest) => postSpaces.request(`${scope}`, data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: getMemberships.requestKey(`${scope}`) })
      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getSyncProjects().requestKey(`${scope}`) })

      setTypedInfiniteQueriesData(queryClient, getSpaces.requestKey({ orgSlug: `${scope}` }), (old) => {
        if (!old) return old
        const [firstPage, ...restPages] = old.pages

        const newFirstPage = {
          ...firstPage,
          data: [newProject, ...firstPage.data].sort((a, b) => {
            if (a.is_general && !b.is_general) return -1
            if (!a.is_general && b.is_general) return 1
            return 0
          })
        }

        return {
          ...old,
          pages: [newFirstPage, ...restPages]
        }
      })
    }
  })
}
