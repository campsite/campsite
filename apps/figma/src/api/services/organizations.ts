import { useQuery } from '@tanstack/react-query'
import { useToken } from 'src/core/tokens'

import { client } from '../client'

export function useGetAllQuery() {
  const token = useToken()

  return useQuery({
    queryKey: [token, 'organizations'],
    queryFn: ({ signal }) =>
      client.organizationMemberships
        .getOrganizationMemberships()
        .request({
          signal,
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then((res) => res.map((m) => m.organization)),
    enabled: !!token
  })
}

export function useGetQuery(organization?: string) {
  const token = useToken()

  return useQuery({
    queryKey: [token, 'organizations', organization],
    queryFn: ({ signal }) =>
      client.organizations.getByOrgSlug().request(organization ?? '', {
        signal,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }),
    enabled: !!token && !!organization,
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 60 // 1 hour
  })
}
