import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useGetProjectId } from 'hooks/useGetProjectId'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

import { useScope } from '@/contexts/scope'
import { apiErrorToast } from '@/utils/apiErrorToast'
import { apiClient, setTypedInfiniteQueriesData } from '@/utils/queryClient'

import { removeCurrentUser, useRemoveProjectFromMembershipsAndFavorites } from './useDeleteProjectMembership'

const deleteProjectsByProjectId = apiClient.organizations.deleteProjectsByProjectId()
const getProjects = apiClient.organizations.getProjects()

export function useDeleteProject() {
  const { scope } = useScope()
  const router = useRouter()
  const projectId = useGetProjectId()
  const queryClient = useQueryClient()
  const removeProjectFromMembershipsAndFavorites = useRemoveProjectFromMembershipsAndFavorites()

  return useMutation({
    mutationFn: (id: string) => deleteProjectsByProjectId.request(`${scope}`, id),
    onSuccess: async (_, id: string) => {
      toast('Channel deleted')

      queryClient.invalidateQueries({ queryKey: apiClient.organizations.getProjects().baseKey })

      await removeProjectFromMembershipsAndFavorites({ projectId: id, userId: removeCurrentUser })

      setTypedInfiniteQueriesData(queryClient, getProjects.requestKey({ orgSlug: `${scope}` }), (old) => {
        if (!old) return

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((project) => project.id !== projectId)
          }))
        }
      })

      if (projectId) {
        router.push(`/${scope}/projects`)
      }
    },
    onError: apiErrorToast
  })
}
