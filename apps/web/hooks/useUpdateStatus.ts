import { useQueryClient } from '@tanstack/react-query'
import { filter, isTruthy, uniqBy } from 'remeda'

import { OrganizationMember, OrganizationsOrgSlugMembersMeStatusesPutRequest } from '@campsite/types'

import { apiClient, getTypedQueryData } from '@/utils/queryClient'

import { getExpiration } from './useCreateStatus'
import { useOptimisticMutation } from './useOptimisticMutation'

interface UpdateStatusParams extends OrganizationsOrgSlugMembersMeStatusesPutRequest {
  org: string
}

export function useUpdateStatus() {
  const queryClient = useQueryClient()

  return useOptimisticMutation({
    mutationFn: ({ org, ...params }: UpdateStatusParams) =>
      apiClient.organizations.putMembersMeStatuses().request(org, {
        ...params,
        expires_at:
          params.expires_at ??
          (params.expiration_setting ? getExpiration(params.expiration_setting)?.toISOString() : undefined)
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
              ...(old.status || {}),
              emoji: params.emoji ?? old.status?.emoji ?? '',
              message: params.message ?? old.status?.message ?? '',
              expiration_setting: params.expiration_setting ?? old.status?.expiration_setting ?? '30m',
              expires_in: params.expiration_setting ?? old.status?.expiration_setting ?? '30m',
              expires_at:
                params.expires_at ??
                (params.expiration_setting
                  ? (getExpiration(params.expiration_setting)?.toISOString() ?? null)
                  : (old.status?.expires_at ?? '')),
              pause_notifications: params.pause_notifications ?? false
            }
          })
        },
        {
          query: {
            queryKey: apiClient.organizations.getMembersMeStatuses().requestKey(org),
            exact: true
          },
          updater: (old: OrganizationsOrgSlugMembersMeStatusesPutRequest[] = []) =>
            uniqBy(
              filter(
                [
                  {
                    emoji: params.emoji ?? '',
                    message: params.message ?? '',
                    expiration_setting: params.expiration_setting ?? '30m',
                    expires_at:
                      params.expires_at ??
                      (params.expiration_setting ? getExpiration(params.expiration_setting)?.toISOString() ?? null : null),
                    pause_notifications: params.pause_notifications ?? false
                  },
                  ...old
                ],
                isTruthy
              ),
              (status) => status.message
            )
        }
      ]
    }
  })
}
