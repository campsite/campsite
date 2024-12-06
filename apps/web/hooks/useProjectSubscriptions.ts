import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import { Project } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient } from '@/utils/queryClient'
import { setNormalizedData } from '@/utils/queryNormalization'

import { useBindCurrentUserEvent } from './useBindCurrentUserEvent'
import { useCreateProjectView } from './useCreateProjectView'

export const useProjectSubscriptions = () => {
  const queryClient = useQueryClient()
  const queryNormalizer = useQueryNormalizer()
  const { scope } = useScope()
  const router = useRouter()
  const { mutate: createProjectView } = useCreateProjectView()

  const markProjectRead = useCallback(
    ({ project_id }: { project_id: string }) => {
      setNormalizedData({
        queryNormalizer,
        type: 'project',
        id: project_id,
        update: { unread_for_viewer: false }
      })
    },
    [queryNormalizer]
  )

  const markProjectUnread = useCallback(
    ({ project_id }: { project_id: string }) => {
      if (router.asPath === `/${scope}/projects/${project_id}`) {
        createProjectView({ projectId: project_id })
        return
      }
      setNormalizedData({
        queryNormalizer,
        type: 'project',
        id: project_id,
        update: { unread_for_viewer: true }
      })
    },
    [createProjectView, queryNormalizer, router.asPath, scope]
  )

  const updateProject = useCallback(
    (newData: Partial<Project> & Required<Pick<Project, 'id'>>) => {
      setNormalizedData({
        queryNormalizer,
        type: 'project',
        id: newData.id,
        update: newData
      })
    },
    [queryNormalizer]
  )

  const invalidateProjectMembershipsAndFavorites = useCallback(() => {
    if (router.pathname === '/[org]/projects/[projectId]') {
      createProjectView({ projectId: router.query.projectId as string })
    }

    queryClient.invalidateQueries({
      queryKey: apiClient.organizations.getProjectMemberships().requestKey(`${scope}`)
    })
    queryClient.invalidateQueries({ queryKey: apiClient.organizations.getFavorites().requestKey(`${scope}`) })
  }, [createProjectView, queryClient, router.pathname, router.query.projectId, scope])

  useBindCurrentUserEvent('new-post-in-project', markProjectUnread)
  useBindCurrentUserEvent('project-memberships-stale', invalidateProjectMembershipsAndFavorites)
  useBindCurrentUserEvent('project-updated', updateProject)
  useBindCurrentUserEvent('project-marked-read', markProjectRead)
  useBindCurrentUserEvent('project-marked-unread', markProjectUnread)
}
