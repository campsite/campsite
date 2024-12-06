import { useEffect, useState } from 'react'

export function useIsOnline() {
  const [online, setOnline] = useState(navigator?.onLine)

  function handleNetworkChange() {
    setOnline(navigator?.onLine)
  }

  useEffect(() => {
    window.addEventListener('online', handleNetworkChange)
    window.addEventListener('offline', handleNetworkChange)

    return () => {
      window.removeEventListener('online', handleNetworkChange)
      window.removeEventListener('offline', handleNetworkChange)
    }
  }, [])

  return online
}
