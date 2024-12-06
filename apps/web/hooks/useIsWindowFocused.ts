import { useEffect, useState } from 'react'

export function useIsWindowFocused() {
  const [isFocused, setIsFocused] = useState(true)

  useEffect(() => {
    function handleFocus() {
      setIsFocused(true)
    }

    function handleBlur() {
      setIsFocused(false)
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return isFocused
}
