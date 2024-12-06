import { useRef } from 'react'

export function useExecuteOnChange<T>(value: T, callback: () => void) {
  const ref = useRef<T>(value)

  if (ref.current !== value) {
    ref.current = value
    callback()
  }
}
