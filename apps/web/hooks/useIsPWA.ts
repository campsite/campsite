import { useEffect, useState } from 'react'

const pwaMatchMedia = () => window.matchMedia('(display-mode: standalone)')

export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(() => pwaMatchMedia().matches)

  useEffect(() => {
    const query = pwaMatchMedia()
    const onChange = (e: MediaQueryListEvent) => setIsPWA(e.matches)

    query.addEventListener('change', onChange)

    return () => {
      query.removeEventListener('change', onChange)
    }
  }, [])

  return isPWA
}
