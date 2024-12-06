import { RefObject, useEffect, useState } from 'react'

import { getImmediateScrollableNode } from '@/utils/scroll'

interface UseAutoScrollOptions {
  ref: RefObject<HTMLElement>
  enabled?: boolean
}

export function useAutoScroll(options: UseAutoScrollOptions) {
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (dragging) {
      const onDragOver = (evt: DragEvent) => {
        if (!options.ref.current) return

        // Scrollable may be the ref (on desktop), or the document/modal (on mobile)
        const scrollable = getImmediateScrollableNode(options.ref.current)

        const rect = scrollable.getBoundingClientRect()
        const normalizedY = Math.max(0, evt.clientY - rect.top)
        const overScroll = rect.height * 0.1

        if (normalizedY < overScroll) {
          const distance = overScroll - normalizedY
          const speed = distance / overScroll

          scrollable.scrollTo(0, scrollable.scrollTop - Math.pow(5, speed))
        } else if (normalizedY > rect.height - overScroll) {
          const distance = normalizedY - rect.height * 0.9
          const speed = distance / overScroll

          scrollable.scrollTo(0, scrollable.scrollTop + Math.pow(5, speed))
        }
      }

      window.addEventListener('dragover', onDragOver)
      return () => {
        window.removeEventListener('dragover', onDragOver)
      }
    }
  }, [dragging, options?.ref])

  useEffect(() => {
    if (options?.enabled ?? true) {
      const onDragStart = () => setDragging(true)
      const onDragEnd = () => setDragging(false)

      window.addEventListener('dragstart', onDragStart)
      window.addEventListener('dragend', onDragEnd)

      return () => {
        window.removeEventListener('dragstart', onDragStart)
        window.removeEventListener('dragend', onDragEnd)
        setDragging(false)
      }
    }
  }, [options?.enabled])
}
