import { useRef } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useToken } from 'src/core/tokens'

import { OrganizationPostSharesPostRequest, OrganizationsOrgSlugPostsPostRequest } from '@campsite/types/generated'

import { client } from '../client'
import { useMeQuery } from './auth'

interface SearchOptions {
  query: string
  organization?: string
}

export function useSearchQuery(options: SearchOptions) {
  const token = useToken()
  const { data: me } = useMeQuery()

  const organizationRef = useRef(options.organization)

  return useQuery({
    queryKey: [token, 'org', options.organization, 'posts', 'search', options.query, me?.username],
    queryFn: ({ signal }) =>
      client.organizations.getSearchPosts().request(
        {
          orgSlug: options.organization ?? '',
          q: options.query,
          author: me?.username
        },
        {
          signal,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      ),
    keepPreviousData: organizationRef.current === options.organization,
    enabled: !!token && !!options.organization && !!me,
    onSuccess() {
      organizationRef.current = options.organization
    }
  })
}

interface CreateOptions {
  organization: string
  data: OrganizationsOrgSlugPostsPostRequest
}

export function useCreateMutation() {
  const token = useToken()

  return useMutation({
    mutationFn: (data: CreateOptions) =>
      client.organizations.postPosts().request(data.organization, data.data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
  })
}

interface ShareOptions {
  organization: string
  postId: string
  data: OrganizationPostSharesPostRequest
}

export function useCreateShare() {
  const token = useToken()

  return useMutation({
    mutationFn: (data: ShareOptions) =>
      client.organizations.postPostsShares().request(data.organization, data.postId, data.data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
  })
}
