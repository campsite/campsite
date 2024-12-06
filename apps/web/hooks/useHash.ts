import { useCallback, useEffect, useState } from 'react'

export function useHash() {
  const [hash, setHash] = useState(() => window.location.hash)

  const hashChangeHandler = useCallback(() => {
    setHash(window.location.hash)
  }, [])

  const updateHash = useCallback(
    (newHash: string) => {
      if (newHash !== hash) window.location.hash = newHash
    },
    [hash]
  )

  useEffect(() => {
    window.addEventListener('hashchange', hashChangeHandler)

    return () => {
      window.removeEventListener('hashchange', hashChangeHandler)
    }
  }, [hashChangeHandler])

  return [hash, updateHash] as const
}
