import { QueryKey } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

export function useGetCurrentPostsFeedQueryKey(): QueryKey | undefined {
  const { scope } = useScope()
  const router = useRouter()

  if (router.pathname === '/[org]' || !!router.query.postId) {
    return apiClient.organizations.getPosts().requestKey({ orgSlug: `${scope}` })
  }
  if (router.query.username) {
    return apiClient.organizations
      .getMembersPosts()
      .requestKey({ orgSlug: `${scope}`, username: router.query.username as string })
  }
  if (router.query.projectId) {
    return apiClient.organizations
      .getProjectsPosts()
      .requestKey({ orgSlug: `${scope}`, projectId: router.query.projectId as string })
  }
  if (router.query.tagName) {
    return apiClient.organizations
      .getTagsPosts()
      .requestKey({ orgSlug: `${scope}`, tagName: router.query.tagName as string })
  }
}
