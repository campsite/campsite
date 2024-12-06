import { useEffect, useState } from 'react'

export function useAppFocused() {
  const doc = typeof document !== 'undefined' ? document : null
  const [isFocused, setIsFocused] = useState(!doc?.hidden)

  useEffect(() => {
    if (!doc) return
    const onChange = () => setIsFocused(doc.hasFocus())

    doc.addEventListener('visibilitychange', onChange)
    window.addEventListener('focus', onChange)
    window.addEventListener('blur', onChange)

    return () => {
      doc.removeEventListener('visibilitychange', onChange)
      window.removeEventListener('focus', onChange)
      window.removeEventListener('blur', onChange)
    }
  }, [doc])

  return isFocused
}
