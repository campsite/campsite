import { useMemo } from 'react'
import { CookieValueTypes } from 'cookies-next'
import { useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { useScope } from '@/contexts/scope'
import { useGetCurrentMemberPosts } from '@/hooks/useGetCurrentMemberPosts'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetForMePosts } from '@/hooks/useGetForMePosts'
import { useGetPosts } from '@/hooks/useGetPosts'
import { atomWithWebStorage } from '@/utils/atomWithWebStorage'

export type PostsIndexFilterType = 'created' | 'all' | 'for-me'
type PostIndexSortType = 'last_activity_at' | 'published_at'

const DEFAULT_FILTER = 'for-me'

export const sortAtom = atomFamily(
  ({ scope, filter }: { scope: CookieValueTypes; filter: string }) =>
    atomWithWebStorage<PostIndexSortType>(`${scope}:posts-index-sort:${filter}`, 'last_activity_at'),
  (a, b) => a.scope === b.scope && a.filter === b.filter
)

export const filterAtom = atomFamily(
  ({ scope }: { scope: CookieValueTypes }) =>
    atomWithWebStorage<PostsIndexFilterType>(`${scope}:posts-index-filter`, DEFAULT_FILTER),
  (a, b) => a.scope === b.scope
)

interface Props {
  enabled?: boolean
  localFilter?: PostsIndexFilterType
  localSort?: PostIndexSortType
  query?: string
}

export function useGetPostsIndex({ enabled = true, localFilter, localSort, query }: Props = {}) {
  const { scope } = useScope()
  const globalFilter = useAtomValue(filterAtom({ scope }))
  const filter = localFilter ?? globalFilter
  const globalSort = useAtomValue(sortAtom({ scope, filter }))
  const sort = localSort ?? globalSort
  const order = useMemo(() => ({ by: sort, direction: 'desc' }) as const, [sort])
  const hideResolved = useGetCurrentUser().data?.preferences.home_display_resolved === 'false'
  const getCurrentMemberPosts = useGetCurrentMemberPosts({ enabled: enabled && filter === 'created', order, query })
  const getForMePosts = useGetForMePosts({ enabled: enabled && filter === 'for-me', order, query, hideResolved })
  const getPosts = useGetPosts({ enabled: enabled && filter === 'all', order, query })

  return {
    getPosts: filter === 'created' ? getCurrentMemberPosts : filter === 'for-me' ? getForMePosts : getPosts,
    order,
    sort,
    filter
  }
}
