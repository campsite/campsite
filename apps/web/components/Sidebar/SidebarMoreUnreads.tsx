import { useMemo, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { atom, useAtomValue } from 'jotai'

import { UIText } from '@campsite/ui/Text'

import { getSidebarLinkId } from '@/components/Sidebar/SidebarLink'
import { notEmpty } from '@/utils/notEmpty'

const OFFSET = 30

export const SIDEBAR_SCROLL_CONTAINER_ID = 'sidebar-scroll-container'

const unreadSidebarItemIdsAtom = atom<string[]>([])

export const setUnreadSidebarItemIdsAtom = atom(
  null,
  (_, set, action: { type: 'remove'; id: string } | { type: 'add'; id: string }) =>
    set(unreadSidebarItemIdsAtom, (prev) => {
      if (action?.type === 'remove') {
        return prev.filter((id) => id !== action.id)
      } else if (action?.type === 'add') {
        return [...prev, action.id]
      }

      return prev
    })
)

interface SidebarMoreUnreadsButtonProps {
  active: boolean
  onClick: () => void
  align: 'top' | 'bottom'
  offset?: number
}

function SidebarMoreUnreadsButton({ active, onClick, align, offset = 0 }: SidebarMoreUnreadsButtonProps) {
  return (
    <AnimatePresence>
      {active && (
        <m.button
          transition={{
            duration: 0.2
          }}
          initial={{
            opacity: 0,
            y: align === 'top' ? 40 : 12 - offset,
            left: '50%',
            translateX: '-50%'
          }}
          animate={{
            opacity: 1,
            y: align === 'top' ? 52 : -offset
          }}
          exit={{
            opacity: 0,
            y: align === 'top' ? 40 : 12 - offset
          }}
          onClick={onClick}
          className='absolute bottom-2 z-10 flex transform-gpu items-center justify-center rounded-full bg-blue-500 px-4 py-2 text-blue-50 shadow shadow-[inset_0px_1px_0px_rgba(255,255,255,0.04),_0px_2px_12px_rgba(0,0,0,0.4),_0px_0px_0px_1px_rgba(0,0,0,0.8)]'
        >
          <UIText weight='font-bold' inherit size='text-xs' className='whitespace-nowrap'>
            More unreads
          </UIText>
        </m.button>
      )}
    </AnimatePresence>
  )
}

export function SidebarMoreUnreadsTop() {
  const unreadSidebarItemIds = useAtomValue(unreadSidebarItemIdsAtom)
  const firstUnreadSidebarbarItemId = useMemo(() => {
    const scrollElement = document.getElementById(SIDEBAR_SCROLL_CONTAINER_ID)

    if (!scrollElement || !unreadSidebarItemIds.length) return

    const scrollElementTop = scrollElement.getBoundingClientRect().top + scrollElement.scrollTop

    return unreadSidebarItemIds
      .map((id) => {
        const element = document.getElementById(getSidebarLinkId(id))

        return element ? { id, top: element.getBoundingClientRect().top + scrollElement.scrollTop } : null
      })
      .filter(notEmpty)
      .filter((item) => item.top <= scrollElementTop)
      .sort((a, b) => a.top - b.top)[0]?.id
  }, [unreadSidebarItemIds])

  const handleClick = () => {
    if (!firstUnreadSidebarbarItemId) return

    const sidebarItemElement = document.getElementById(getSidebarLinkId(firstUnreadSidebarbarItemId))
    const scrollElement = document.getElementById(SIDEBAR_SCROLL_CONTAINER_ID)

    if (!scrollElement || !sidebarItemElement) return

    const elementRect = sidebarItemElement.getBoundingClientRect()
    const containerRect = scrollElement.getBoundingClientRect()

    const elementTop = elementRect.top - containerRect.top + scrollElement.scrollTop
    const offsetPosition = elementTop - OFFSET

    scrollElement.scrollTo({ top: offsetPosition, behavior: 'smooth' })
  }

  return <SidebarMoreUnreadsButton align='top' active={!!firstUnreadSidebarbarItemId} onClick={handleClick} />
}

export function SidebarMoreUnreadsBottom() {
  const unreadSidebarItemIds = useAtomValue(unreadSidebarItemIdsAtom)
  const [offset, setOffset] = useState(0)

  const lastUnreadSidebarbarItemId = useMemo(() => {
    const scrollElement = document.getElementById(SIDEBAR_SCROLL_CONTAINER_ID)

    if (!scrollElement || !unreadSidebarItemIds.length) return

    const scrollElementBottom = scrollElement.getBoundingClientRect().bottom + scrollElement.scrollTop
    const viewportHeight = window.innerHeight

    setOffset(viewportHeight - scrollElement.getBoundingClientRect().bottom)

    return unreadSidebarItemIds
      .map((id) => {
        const element = document.getElementById(getSidebarLinkId(id))

        return element ? { id, bottom: element.getBoundingClientRect().bottom + scrollElement.scrollTop } : null
      })
      .filter(notEmpty)
      .filter((item) => item.bottom > scrollElementBottom)
      .sort((a, b) => b.bottom - a.bottom)[0]?.id
  }, [unreadSidebarItemIds])

  const handleClick = () => {
    if (!lastUnreadSidebarbarItemId) return

    const sidebarItemElement = document.getElementById(getSidebarLinkId(lastUnreadSidebarbarItemId))
    const scrollElement = document.getElementById(SIDEBAR_SCROLL_CONTAINER_ID)

    if (!scrollElement || !sidebarItemElement) return

    const elementRect = sidebarItemElement.getBoundingClientRect()
    const containerRect = scrollElement.getBoundingClientRect()

    const elementBottom = elementRect.bottom - containerRect.top + scrollElement.scrollTop
    const offsetPosition = elementBottom - scrollElement.clientHeight + OFFSET

    scrollElement.scrollTo({ top: offsetPosition, behavior: 'smooth' })
  }

  return (
    <SidebarMoreUnreadsButton
      align='bottom'
      active={!!lastUnreadSidebarbarItemId}
      onClick={handleClick}
      offset={offset}
    />
  )
}
