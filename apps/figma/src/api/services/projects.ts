import { useRef } from 'react'
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToken } from 'src/core/tokens'

import { client } from '../client'

export function useGetQuery(organization: string | undefined, projectId: string | undefined) {
  const token = useToken()

  return useQuery({
    queryKey: [token, 'org', organization, 'projects', projectId],
    queryFn: ({ signal }) =>
      client.organizations.getProjectsByProjectId().request(organization ?? '', projectId ?? '', {
        signal,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }),
    enabled: !!token && !!organization && !!projectId
  })
}

interface SearchOptions {
  organization?: string
  query: string
}

export function useSearchQuery(options: SearchOptions) {
  const token = useToken()
  const queryClient = useQueryClient()

  const organizationRef = useRef(options.organization)

  return useInfiniteQuery({
    queryKey: [token, 'org', options.organization, 'projects', 'search', options.query],
    queryFn: ({ signal, pageParam }) =>
      client.organizations.getProjects().request(
        {
          orgSlug: options.organization ?? '',
          after: pageParam,
          q: options.query,
          limit: 50
        },
        {
          signal,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      ),
    keepPreviousData: organizationRef.current === options.organization,
    enabled: !!token && !!options.organization,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    onSuccess(data) {
      organizationRef.current = options.organization
      const projects = data.pages.flatMap((page) => page.data)

      projects.forEach((project) => {
        queryClient.setQueryData([token, 'org', options.organization, 'projects', project.id], project)
      })
    }
  })
}
