import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Props = {
  query: string
}

const getSearchResourceMentions = apiClient.organizations.getSearchResourceMentions()

export function useSearchResourceMentions({ query }: Props) {
  const { scope } = useScope()

  return useQuery({
    queryKey: getSearchResourceMentions.requestKey({
      orgSlug: `${scope}`,
      q: query
    }),
    queryFn: async () =>
      getSearchResourceMentions.request({
        orgSlug: `${scope}`,
        q: query
      }),
    enabled: !!query,
    placeholderData: keepPreviousData
  })
}
