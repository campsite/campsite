import { useMemo } from 'react'

type ReactRef<T> = React.RefCallback<T> | React.MutableRefObject<T>

function assignRef<T = any>(ref: ReactRef<T> | null | undefined, value: T) {
  if (ref == null) return

  if (typeof ref === 'function') {
    ref(value)
  } else {
    ref.current = value
  }
}

function mergeRefs<T>(...refs: (ReactRef<T> | null | undefined)[]) {
  return (node: T | null) => {
    refs.forEach((ref) => {
      assignRef(ref, node)
    })
  }
}

export function useMergeRefs<T>(...refs: (ReactRef<T> | null | undefined)[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => mergeRefs(...refs), refs)
}
