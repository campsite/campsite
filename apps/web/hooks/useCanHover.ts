import { useState } from 'react'
import { useIsomorphicLayoutEffect } from 'framer-motion'

export function useCanHover() {
  const [match, setMatch] = useState(() => window.matchMedia(`(hover: hover) and (pointer: fine)`).matches)

  useIsomorphicLayoutEffect(() => {
    const query = window.matchMedia(`(hover: hover) and (pointer: fine)`)
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches !== match) {
        setMatch(e.matches)
      }
    }

    if (query.matches !== match) {
      setMatch(query.matches)
    }
    query.addEventListener('change', onChange)

    return () => {
      query.removeEventListener('change', onChange)
    }
  }, [match])

  return match
}
