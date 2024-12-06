import { useQuery } from '@tanstack/react-query'

import { PostSeoInfo } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

const query = apiClient.organizations.getPostsSeoInfo()

type Options = {
  initialData?: PostSeoInfo
}

export function useGetPostSeoInfo(id?: string, options?: Options) {
  const initialData = options?.initialData
  const { scope } = useScope()

  return useQuery({
    queryKey: query.requestKey(`${scope}`, `${id}`),
    queryFn: () => query.request(`${scope}`, `${id}`),
    initialData,
    enabled: !!scope && !!id,
    staleTime: 10000,
    gcTime: Infinity
  })
}
