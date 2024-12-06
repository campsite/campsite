import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ProjectMembership } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

import { setProjectMembershipsCache } from './useGetProjectMemberships'

function patchPosition(ids: string[], projectMemberships: ProjectMembership[]) {
  return projectMemberships.map((f) => {
    const index = ids.indexOf(f.id)

    return index === -1 ? f : { ...f, position: index }
  })
}

export function useReorderProjectMemberships() {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  // optimistically update the cache without making an API call while dragging
  const onReorder = (ids: string[]) => {
    setProjectMembershipsCache(queryClient, scope, (prev) => {
      return prev ? patchPosition(ids, prev) : prev
    })
  }

  const mutation = useMutation({
    mutationFn: (ids: string[]) =>
      apiClient.organizations.putProjectMembershipsReorder().request(`${scope}`, {
        project_memberships: ids.map((id, position) => ({ id, position }))
      })
  })

  return { onReorder, mutation }
}
