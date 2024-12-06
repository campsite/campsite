import { useEffect, useRef } from 'react'
import { atom, PrimitiveAtom, useSetAtom } from 'jotai'
import { useRouter } from 'next/router'

import { useGetNotesIndex } from '@/components/NotesIndex/useGetNotesIndex'
import { useGetCalls } from '@/hooks/useGetCalls'
import { useGetNotifications } from '@/hooks/useGetNotifications'
import { useGetPostsIndex } from '@/hooks/useGetPostsIndex'
import { getImmediateScrollableNode, scrollImmediateScrollableNodeToTop } from '@/utils/scroll'

interface MobileTabActionProps {
  active: boolean
  refetchAtom: PrimitiveAtom<any>
  refetch: () => void
  isFetching: boolean
}

export function useNavigationTabAction({ active, refetchAtom, refetch, isFetching }: MobileTabActionProps) {
  const { pathname } = useRouter()
  const setIsRefetching = useSetAtom(refetchAtom)
  const refetchTime = useRef<number | null>(null)

  useEffect(() => {
    if (!refetchTime.current) return

    const minRefetchTime = 1000
    const now = new Date().getTime()
    const diff = now - refetchTime.current

    if (!isFetching) {
      if (diff > minRefetchTime) {
        setIsRefetching(false)
      } else {
        setTimeout(() => setIsRefetching(false), minRefetchTime - diff)
      }
    }
  }, [isFetching, setIsRefetching])

  function handleClick() {
    if (active) {
      const el = getImmediateScrollableNode(document.getElementById(pathname))
      const scrollOffset = el?.scrollTop

      if (!el) return
      if (scrollOffset === undefined) return

      if (scrollOffset > 50) {
        scrollImmediateScrollableNodeToTop(el)
      } else {
        scrollImmediateScrollableNodeToTop(el)
        refetch()
        refetchTime.current = new Date().getTime()
        setIsRefetching(true)
      }
    }
  }

  return handleClick
}

export const refetchingCallsAtom = atom(false)
export const refetchingChatAtom = atom(false)
export const refetchingInboxAtom = atom(false)
export const refetchingNotesAtom = atom(false)
export const refetchingPostsAtom = atom(false)

export function useRefetchPostsIndex() {
  const router = useRouter()
  const active = router.pathname === '/[org]/posts'
  const { getPosts } = useGetPostsIndex({ enabled: active })

  const { isFetching, refetch } = getPosts

  return useNavigationTabAction({
    active,
    refetchAtom: refetchingPostsAtom,
    refetch,
    isFetching
  })
}

export function useRefetchNotesIndex() {
  const router = useRouter()
  const active = router.pathname === '/[org]/notes'
  const { refetch, isFetching } = useGetNotesIndex({ enabled: active })

  return useNavigationTabAction({
    active,
    refetchAtom: refetchingNotesAtom,
    refetch,
    isFetching
  })
}

export function useRefetchInboxIndex() {
  const router = useRouter()
  const active = router.pathname === '/[org]/inbox/[inboxView]'
  const { refetch, isFetching } = useGetNotifications({ filter: 'home', enabled: active })

  return useNavigationTabAction({
    active,
    refetchAtom: refetchingInboxAtom,
    refetch,
    isFetching
  })
}

export function useRefetchCallsIndex() {
  const router = useRouter()
  const active = router.pathname === '/[org]/calls'
  const { refetch, isFetching } = useGetCalls({ enabled: active })

  return useNavigationTabAction({
    active,
    refetchAtom: refetchingCallsAtom,
    refetch,
    isFetching
  })
}
