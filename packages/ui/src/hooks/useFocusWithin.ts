import { useEffect, useRef, useState } from 'react'

export function useFocusWithin() {
  const ref = useRef<HTMLElement>(null)
  const [isFocusedWithin, setIsFocusedWithin] = useState(false)

  useEffect(() => {
    const element = ref.current

    if (!element) return

    const handleFocusIn = () => setIsFocusedWithin(true)
    const handleFocusOut = () => setIsFocusedWithin(false)

    element.addEventListener('focusin', handleFocusIn)
    element.addEventListener('focusout', handleFocusOut)

    return () => {
      element.removeEventListener('focusin', handleFocusIn)
      element.removeEventListener('focusout', handleFocusOut)
    }
  }, [ref])

  return { ref, isFocusedWithin }
}
