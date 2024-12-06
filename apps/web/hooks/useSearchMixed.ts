import { useQuery } from '@tanstack/react-query'

import { GetSearchMixedParams, SearchCall, SearchNote, SearchPost } from '@campsite/types'

import { useScope } from '@/contexts/scope'
import { apiClient } from '@/utils/queryClient'

type Props = {
  query: string
  focus: string
}

function isFocus(str: string | undefined): str is GetSearchMixedParams['focus'] {
  return str === 'calls' || str === 'posts' || str === 'notes' || str === undefined
}

function getFocus(focus: string | undefined) {
  return isFocus(focus) ? focus : undefined
}

const getSearchMixed = apiClient.organizations.getSearchMixed()

export function useSearchMixed({ query, focus }: Props) {
  const { scope } = useScope()

  return useQuery({
    queryKey: getSearchMixed.requestKey({
      orgSlug: `${scope}`,
      q: query,
      focus: getFocus(focus)
    }),
    queryFn: async () => {
      const results = await getSearchMixed.request({
        orgSlug: `${scope}`,
        q: query,
        focus: getFocus(focus)
      })

      const callsMap = new Map<string, SearchCall>()
      const postsMap = new Map<string, SearchPost>()
      const notesMap = new Map<string, SearchNote>()

      results.calls.forEach((call) => callsMap.set(call.id, call))
      results.posts.forEach((post) => postsMap.set(post.id, post))
      results.notes.forEach((note) => notesMap.set(note.id, note))

      return {
        items: results.items,
        callsMap,
        postsMap,
        notesMap
      }
    },
    enabled: !!query
  })
}
