import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Organization, User } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useQueryNormalizer } from '@/utils/normy/QueryNormalizerProvider'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'
import { setNormalizedData } from '@/utils/queryNormalization'

import { useBindChannelEvent } from './useBindChannelEvent'
import { useOrganizationChannel } from './useOrganizationChannel'

type NewPostEvent = {
  user_id?: string
  username?: string
  project_ids: string[]
  tag_names: string[]
}

const getMe = apiClient.users.getMe()
const getSyncMembers = apiClient.organizations.getSyncMembers()

export function useLiveOrganizationUpdates(organization?: Organization) {
  const queryClient = useQueryClient()
  const organizationChannel = useOrganizationChannel(organization)
  const { scope } = useScope()
  const queryNormalizer = useQueryNormalizer()
  const { data: currentUser } = useGetCurrentUser()

  const invalidateFeedQueries = useCallback(
    function (event: NewPostEvent) {
      const { username, project_ids } = event

      if (!organization) return

      if (username) {
        queryClient.invalidateQueries({
          queryKey: apiClient.organizations.getMembersPosts().requestKey({ orgSlug: organization.slug, username })
        })
      }

      project_ids.forEach((projectId) => {
        queryClient.invalidateQueries({
          queryKey: apiClient.organizations.getProjectsPosts().requestKey({ orgSlug: organization.slug, projectId })
        })
      })

      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getMembersMeForMePosts().requestKey({ orgSlug: organization.slug })
      })

      queryClient.invalidateQueries({
        queryKey: apiClient.organizations.getPosts().requestKey({ orgSlug: organization.slug })
      })
    },
    [organization, queryClient]
  )

  const updateUser = useCallback(
    ({ user }: { user: User }) => {
      setNormalizedData({
        queryNormalizer,
        type: 'user',
        id: user.id,
        update: user
      })

      setTypedQueryData(queryClient, getSyncMembers.requestKey(`${scope}`), (old) => {
        if (!old) return old

        return old.map((member) => {
          if (member.user.id === user.id) {
            return { ...member, ...user }
          }

          return member
        })
      })

      if (currentUser?.id === user.id) {
        setTypedQueryData(queryClient, getMe.requestKey(), (old) => {
          if (!old) return old
          return { ...old, ...user }
        })
      }
    },
    [currentUser?.id, queryClient, queryNormalizer, scope]
  )

  useBindChannelEvent(organizationChannel, 'posts-stale', invalidateFeedQueries)
  useBindChannelEvent(organizationChannel, 'user-stale', updateUser)
}
