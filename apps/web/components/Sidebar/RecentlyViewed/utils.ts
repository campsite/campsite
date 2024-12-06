import { useEffect } from 'react'
import { CookieValueTypes } from 'cookies-next'
import deepEqual from 'fast-deep-equal'
import { atom, useSetAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { useInView } from 'react-intersection-observer'

import { Call, Note, Post } from '@campsite/types/generated'

import { useScope } from '@/contexts/scope'
import { atomWithWebStorage } from '@/utils/atomWithWebStorage'

interface LocalRecentlyViewedType {
  id: string
  post?: LocalPost
  note?: LocalNote
  call?: LocalCall
}

interface RecentlyViewedItem {
  id: string
  post?: Post
  note?: Note
  call?: Call
}

const pluckedRecentlyViewedItem = ({ id, post, note, call }: RecentlyViewedItem): LocalRecentlyViewedType => ({
  id,
  post: post
    ? {
        id,
        title: post.title || post.truncated_description_text,
        project: post.project,
        created_at: post.published_at ?? post.created_at,
        url: post.url
      }
    : undefined,
  note: note ? { id, title: note.title, project: note.project, created_at: note.created_at, url: note.url } : undefined,
  call: call ? { id, title: call.title, project: call.project, created_at: call.created_at, url: call.url } : undefined
})

export const recentlyViewedAtom = atomFamily((scope: CookieValueTypes) =>
  atomWithWebStorage<LocalRecentlyViewedType[]>(`recently-viewed:${scope}`, [])
)

export type LocalPost = Pick<Post, 'id' | 'title' | 'project' | 'created_at' | 'url'>
export type LocalNote = Pick<Note, 'id' | 'title' | 'project' | 'created_at' | 'url'>
export type LocalCall = Pick<Call, 'id' | 'title' | 'project' | 'created_at' | 'url'>

const addRecentlyViewedAtom = atom(
  null,
  (get, set, { scope, item }: { scope: CookieValueTypes; item: RecentlyViewedItem }) => {
    const scoped = recentlyViewedAtom(scope)
    const prev = get(scoped)
    const plucked = pluckedRecentlyViewedItem(item)
    const next = [plucked, ...prev.filter((record) => record.id !== plucked.id)].slice(0, 10)

    return set(recentlyViewedAtom(scope), next)
  }
)

const removeRecentlyViewedAtom = atom(null, (get, set, { scope, id }: { scope: CookieValueTypes; id: string }) => {
  const scoped = recentlyViewedAtom(scope)
  const prev = get(scoped)
  const next = prev.filter((record) => record.id !== id)

  return set(recentlyViewedAtom(scope), next)
})

const updateRecentlyViewedAtom = atom(
  null,
  (get, set, { scope, item }: { scope: CookieValueTypes; item: RecentlyViewedItem }) => {
    const scoped = recentlyViewedAtom(scope)
    const prev = get(scoped)
    const plucked = pluckedRecentlyViewedItem(item)
    const match = prev.findIndex((record) => record.id === item.id)

    if (match && deepEqual(prev[match], plucked)) {
      const next = [...prev]

      next[match] = plucked

      return set(recentlyViewedAtom(scope), next)
    }
  }
)

export function useTrackRecentlyViewedItem({ id, post, note, call }: RecentlyViewedItem) {
  const { scope } = useScope()
  const addRecentlyViewed = useSetAtom(addRecentlyViewedAtom)
  const [inViewRef, inView] = useInView({ triggerOnce: true })

  useEffect(() => {
    if (inView) {
      addRecentlyViewed({ scope, item: { id, post, note, call } })
    }
  }, [addRecentlyViewed, call, id, inView, note, post, scope])

  return inViewRef
}

export function useSyncRecentlyViewedItem({
  id,
  post,
  note,
  call,
  isError
}: RecentlyViewedItem & { isError: boolean }) {
  const { scope } = useScope()
  const removeRecentlyViewed = useSetAtom(removeRecentlyViewedAtom)
  const updateRecentlyViewed = useSetAtom(updateRecentlyViewedAtom)

  useEffect(() => {
    if (isError) {
      removeRecentlyViewed({ scope, id })
    } else {
      updateRecentlyViewed({ scope, item: { id, post, note, call } })
    }
  }, [post, note, call, removeRecentlyViewed, updateRecentlyViewed, scope, id, isError])
}
