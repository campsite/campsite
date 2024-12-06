import { useEffect, useMemo, useRef } from 'react'

/**
 * A custom hook that converts a callback to a ref to avoid triggering re-renders when passed as a
 * prop or avoid re-executing effects when passed as a dependency
 *
 * @source https://github.com/radix-ui/primitives/blob/dbefd647297bd6594577c3fc253dc874fbe11438/packages/react/use-callback-ref/src/useCallbackRef.tsx#L7
 *
 */
function useCallbackRef<T extends unknown[], R>(callback?: (...args: T) => R): (...args: T) => R | undefined {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  })

  return useMemo(() => {
    return (...args: T) => callbackRef.current?.(...args)
  }, [])
}

export { useCallbackRef }
