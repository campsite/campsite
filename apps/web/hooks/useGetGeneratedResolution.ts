import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { GeneratedHtml } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { useBindCurrentUserEvent } from '@/hooks/useBindCurrentUserEvent'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

const query = apiClient.organizations.getPostsGeneratedResolution()

type Props = {
  postId: string
  commentId?: string
  enabled: boolean
}

export function useGetGeneratedResolution({ postId, commentId, enabled }: Props) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  const result = useQuery({
    queryKey: query.requestKey({ orgSlug: `${scope}`, postId, comment_id: commentId }),
    queryFn: () => query.request({ orgSlug: `${scope}`, postId, comment_id: commentId }),
    enabled
  })

  const updateOnStatusChange = useCallback(
    (data: GeneratedHtml) => {
      const queryKey = query.requestKey({ orgSlug: `${scope}`, postId, comment_id: commentId })

      queryClient.cancelQueries({ queryKey })
      setTypedQueryData(queryClient, queryKey, data)
    },
    [commentId, postId, queryClient, scope]
  )

  // NOTE: the server matches this event name pattern
  let eventName = `post-resolution-generation:${postId}`

  if (commentId) {
    eventName += `:${commentId}`
  }

  useBindCurrentUserEvent(eventName, updateOnStatusChange)

  return result
}
