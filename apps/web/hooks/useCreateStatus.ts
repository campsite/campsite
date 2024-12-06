import { useQueryClient } from '@tanstack/react-query'

import { OrganizationMember, OrganizationsOrgSlugMembersMeStatusesPostRequest } from '@campsite/types'

import { apiClient, getTypedQueryData } from '@/utils/queryClient'

import { useOptimisticMutation } from './useOptimisticMutation'

interface CreateStatusParams extends OrganizationsOrgSlugMembersMeStatusesPostRequest {
  org: string
}

export function getExpiration(expiresIn: OrganizationsOrgSlugMembersMeStatusesPostRequest['expiration_setting']) {
  switch (expiresIn) {
    case '30m': {
      return new Date(Date.now() + 30 * 60 * 1000)
    }
    case '1h': {
      return new Date(Date.now() + 60 * 60 * 1000)
    }
    case '4h': {
      return new Date(Date.now() + 4 * 60 * 60 * 1000)
    }
    case 'today': {
      const date = new Date()

      // Set to end of day in local timezone
      date.setHours(23, 59, 59, 999)
      return date
    }
    case 'this_week': {
      const date = new Date()

      // Set to end of week in local timezone
      date.setDate(date.getDate() + (7 - date.getDay()))
      date.setHours(23, 59, 59, 999)
      return date
    }
  }
}

export function useCreateStatus() {
  const queryClient = useQueryClient()

  return useOptimisticMutation({
    mutationFn: ({ org, ...params }: CreateStatusParams) =>
      apiClient.organizations.postMembersMeStatuses().request(org, {
        ...params,
        expires_at: params.expires_at ?? getExpiration(params.expiration_setting)?.toISOString()
      }),
    optimisticFns: ({ org, ...params }) => {
      const currentUser = getTypedQueryData(queryClient, apiClient.users.getMe().requestKey())

      if (!currentUser) return []

      return [
        {
          query: {
            queryKey: apiClient.organizations.getMembersByUsername().requestKey(org, currentUser.username),
            exact: true
          },
          updater: (old: OrganizationMember): OrganizationMember => ({
            ...old,
            status: {
              emoji: params.emoji,
              message: params.message,
              expiration_setting: params.expiration_setting,
              expires_in: params.expiration_setting,
              expires_at: params.expires_at ?? getExpiration(params.expiration_setting)?.toISOString() ?? null,
              pause_notifications: params.pause_notifications ?? false
            }
          })
        }
      ]
    }
  })
}
