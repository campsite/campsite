import { useEffect, useState } from 'react'

export function useFigmaEmbedLoaded() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const updateLoaded = (e: MessageEvent) => {
      const isFileLoadedEvent = e.data === 'LOAD_FINISHED' && e.origin === 'https://www.figma.com'
      const isPrototypeLoadedEvent = e.data?.type === 'INITIAL_LOAD' && e.origin === 'https://www.figma.com'

      if (isFileLoadedEvent || isPrototypeLoadedEvent) setLoaded(true)
    }

    window.addEventListener('message', updateLoaded)
    return () => window.removeEventListener('message', updateLoaded)
  }, [])

  return loaded
}
