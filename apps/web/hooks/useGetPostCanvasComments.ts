import { useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getPostsCanvasComments()

interface Props {
  postId: string
  limit?: number
  enabled?: boolean
}

export function useGetPostCanvasComments({ postId, enabled = true }: Props) {
  const { scope } = useScope()

  const result = useQuery({
    queryKey: query.requestKey(`${scope}`, postId),
    queryFn: () => query.request(`${scope}`, postId),
    enabled: enabled && !!postId,
    refetchOnWindowFocus: true
  })

  return result
}
