import { HTMLProps, useRef } from 'react'
import { useIsomorphicLayoutEffect } from 'framer-motion'

import { getImmediateScrollableNode } from '@/utils/scroll'

export function KeepInView({ children, ...props }: HTMLProps<HTMLDivElement>) {
  const elementRef = useRef<HTMLDivElement>(null)

  const lastYRef = useRef(0)
  const lastHeightRef = useRef(0)
  const lastScrollHeightRef = useRef(0)

  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current

    if (!element) return

    const scrollParent = getImmediateScrollableNode(element)

    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect

      const currentY = rect.y + rect.height
      const lastY = lastYRef.current + lastHeightRef.current

      const currentScrollHeight = scrollParent.scrollHeight
      const lastScrollHeight = lastScrollHeightRef.current

      lastYRef.current = rect.y
      lastHeightRef.current = rect.height
      lastScrollHeightRef.current = currentScrollHeight

      // Get the delta between the last position and the current position
      let delta = currentY - lastY

      if (delta < 0) {
        // If the element shrinks, we need to scroll up
        delta += lastScrollHeight - currentScrollHeight
      }

      // If there is no change, return early
      if (delta === 0) return
      // If the focus is not within, return early
      if (!element.contains(document.activeElement)) return

      scrollParent.scrollBy({ top: delta, behavior: 'auto' })
    })

    // Set initial values
    const rect = element.getBoundingClientRect()

    lastYRef.current = rect.y
    lastHeightRef.current = rect.height
    lastScrollHeightRef.current = scrollParent.scrollHeight

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={elementRef} {...props}>
      {children}
    </div>
  )
}
