import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'

import { GetProjectsNotesParams } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Props = {
  projectId: string
  query?: GetProjectsNotesParams['q']
  order?: GetProjectsNotesParams['order']
}

const getProjectsNotes = apiClient.organizations.getProjectsNotes()

export function useGetProjectNotes({ projectId, query, order }: Props) {
  const { scope } = useScope()

  return useInfiniteQuery({
    queryKey: getProjectsNotes.requestKey({ orgSlug: `${scope}`, projectId, q: query, order }),
    queryFn: ({ pageParam }) =>
      getProjectsNotes.request({ orgSlug: `${scope}`, projectId, after: pageParam, q: query, order }),
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    getPreviousPageParam: (firstPage) => firstPage.prev_cursor,
    initialPageParam: undefined as string | undefined,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData
  })
}
