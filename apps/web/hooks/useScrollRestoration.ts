import { RefObject, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'

import { useScope } from '@/contexts/scope'

const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>

  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}

const cache = new Map()

let isNavigatingBack = false

/**
 * Remembers scroll position for the current path x element and
 * restores scroll position if the user navigates back.
 */
export function useScrollRestoration(ref: RefObject<HTMLDivElement>, { enabled = true }: { enabled?: boolean } = {}) {
  const { scope } = useScope()
  const scopeRef = useRef(scope)
  const router = useRouter()
  const { asPath: key } = router

  useEffect(() => {
    const el = ref.current

    function setPosition(el: any) {
      if (!enabled) return
      cache.set(key, el.scrollTop)
    }
    const setPositionDebounced = debounce(() => setPosition(el), 100)

    function handleScopeChange() {
      const scopeChanged = scopeRef.current !== scope

      if (scopeChanged) {
        cache.clear()
        scopeRef.current = scope
      }
    }

    function handlePopState() {
      isNavigatingBack = true
    }

    const handleRouteChange = () => {
      if (!isNavigatingBack) return

      isNavigatingBack = false

      if (!el || !enabled) return

      const prev = cache.get(key)

      el.scrollTop = prev ? parseInt(prev, 10) : 0
    }

    handleScopeChange()
    handleRouteChange()

    el?.addEventListener('scroll', setPositionDebounced, { passive: true })
    window.addEventListener('popstate', handlePopState)

    return () => {
      el?.removeEventListener('scroll', setPositionDebounced)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [enabled, key, ref, router.events, scope])

  return null
}
