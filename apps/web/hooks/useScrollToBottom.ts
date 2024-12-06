import { RefObject, useLayoutEffect } from 'react'

interface UseScrollToBottomOptions {
  stickyRef: RefObject<HTMLElement>
  scrollElementRef: RefObject<HTMLElement>
  /**
   * Buffer of pixels to consider the user at the bottom of the scroll area.
   * Especially useful on mobile devices where the scroll area is not always
   * perfectly aligned with the bottom of the screen (due to keyboard jank
   * or subtle touch inputs).
   */
  scrollSlop?: number
}

export function useScrollToBottom(options: UseScrollToBottomOptions) {
  const scrollSlop = options.scrollSlop ?? 16
  const scrollElement = options.scrollElementRef.current
  const stickyElement = options.stickyRef.current

  useLayoutEffect(() => {
    if (!scrollElement) return

    let raf = 0
    let prevScrollHeight = scrollElement.scrollHeight
    let atBottom = true
    let resizing = false
    let resizeTimeout: NodeJS.Timeout | undefined

    /**
     *
     *     ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ————————————————————————
     *     ∙                 ∙  ▲                   ▲
     *     ∙                 ∙  │                   │
     *     ∙                 ∙  │ scrollTop         │
     *     ∙                 ∙  │                   │
     *     ∙                 ∙  ▼                   │
     *     |-----------------|—————                 │
     *     |                ▓|  ▲                   │
     *     |                ▓|  │                   │ scrollHeight
     *     |   Scroll Area   |  │ clientHeight      │
     *     |                 |  │                   │
     *     |                 |  ▼                   │
     *     |-----------------|—————                 │
     *     ∙                 ∙                      │
     *     ∙                 ∙                      │
     *     ∙                 ∙                      ▼
     *     ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ————————————————————————  ◄——— atBottom
     *
     *
     * maxScrollTop = scrollHeight - clientHeight
     * atBottom = scrollTop >= maxScrollTop - scrollSlop
     *
     */

    function updateScroll() {
      if (!scrollElement) return

      const maxScrollTop = scrollElement.scrollHeight - scrollElement.clientHeight

      /**
       * If we were at the bottom during the last scroll event,
       * then any paint updates that update the scroll element (i.e. height increase)
       * should re-sync scroll to the bottom.
       *
       * Take into account `scrollSlop` only if we are not resizing. This prevents unwanted
       * scroll jumps when the user is resizing the window and paints are lagging behind.
       */
      if (atBottom && scrollElement.scrollTop < maxScrollTop - (resizing ? 0 : scrollSlop)) {
        scrollElement.scrollTo({ top: maxScrollTop, behavior: 'instant' })
      }

      const delta = scrollElement.scrollHeight - prevScrollHeight

      if (!atBottom && delta > 0) {
        scrollElement.scrollTo({ top: scrollElement.scrollTop + delta, behavior: 'instant' })
      }

      raf = requestAnimationFrame(updateScroll)
    }

    function onResize() {
      clearTimeout(resizeTimeout)
      resizing = true

      resizeTimeout = setTimeout(() => {
        resizing = false
      }, 1)
    }

    function onScroll() {
      if (!scrollElement) return
      if (resizing) return

      if (!atBottom || scrollElement.scrollHeight === prevScrollHeight) {
        const maxScrollTop = scrollElement.scrollHeight - scrollElement.clientHeight

        atBottom = scrollElement.scrollTop >= maxScrollTop - scrollSlop
      }

      prevScrollHeight = scrollElement.scrollHeight
    }

    raf = requestAnimationFrame(updateScroll)
    window.addEventListener('resize', onResize, { passive: true })
    scrollElement.addEventListener('scroll', onScroll, { passive: true })
    const stickyObserver = new ResizeObserver(onResize)

    if (stickyElement) {
      stickyObserver.observe(stickyElement)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      scrollElement.removeEventListener('scroll', onScroll)
      stickyObserver.disconnect()
      clearTimeout(resizeTimeout)
    }
  }, [stickyElement, scrollElement, scrollSlop])
}
