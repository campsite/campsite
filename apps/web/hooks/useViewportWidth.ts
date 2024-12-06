import { useEffect, useState } from 'react'

export function useViewportWidth() {
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateViewportWidth)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateViewportWidth)
      }
    }
  }, [setViewportWidth])

  return viewportWidth
}
