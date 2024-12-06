import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { GeneratedHtml } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { useBindCurrentUserEvent } from '@/hooks/useBindCurrentUserEvent'
import { apiClient, setTypedQueryData } from '@/utils/queryClient'

const query = apiClient.organizations.getPostsGeneratedTldr()

type Props = {
  postId: string
  enabled: boolean
}

export function useGetGeneratedTldr({ postId, enabled }: Props) {
  const { scope } = useScope()
  const queryClient = useQueryClient()

  const result = useQuery({
    queryKey: query.requestKey(`${scope}`, postId),
    queryFn: () => query.request(`${scope}`, postId),
    enabled
  })

  const updateOnStatusChange = useCallback(
    (data: GeneratedHtml) => {
      const queryKey = query.requestKey(`${scope}`, postId)

      queryClient.cancelQueries({ queryKey })
      setTypedQueryData(queryClient, queryKey, data)
    },
    [postId, queryClient, scope]
  )

  // NOTE: the server matches this event name pattern
  let eventName = `post-tldr-generation:${postId}`

  useBindCurrentUserEvent(eventName, updateOnStatusChange)

  return result
}
