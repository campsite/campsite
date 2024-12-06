import { atom, SetStateAction } from 'jotai'

/**
 * @see https://jotai.org/docs/recipes/atom-with-debounce
 */
export default function atomWithDebounce<T>(initialValue: T, delayMilliseconds = 500, shouldDebounceOnReset = false) {
  const prevTimeoutAtom = atom<ReturnType<typeof setTimeout> | undefined>(undefined)

  // DO NOT EXPORT currentValueAtom as using this atom to set state can cause
  // inconsistent state between currentValueAtom and debouncedValueAtom
  const _currentValueAtom = atom(initialValue)
  const isDebouncingAtom = atom(false)

  // Flag to indicate if the value is set from `currentValueAtom`
  const skipDebounceAtom = atom(false)

  const debouncedValueAtom = atom(initialValue, (get, set, update: SetStateAction<T>) => {
    clearTimeout(get(prevTimeoutAtom))

    const prevValue = get(_currentValueAtom)
    const nextValue = typeof update === 'function' ? (update as (prev: T) => T)(prevValue) : update
    const skipDebounce = get(skipDebounceAtom)

    const onDebounceStart = () => {
      set(_currentValueAtom, nextValue)
      set(isDebouncingAtom, true)
    }

    const onDebounceEnd = () => {
      set(debouncedValueAtom, nextValue)
      set(isDebouncingAtom, false)
    }

    onDebounceStart()

    if (skipDebounce || (!shouldDebounceOnReset && nextValue === initialValue)) {
      onDebounceEnd()
      set(skipDebounceAtom, false)
      return
    }

    const nextTimeoutId = setTimeout(() => {
      onDebounceEnd()
    }, delayMilliseconds)

    // set previous timeout atom in case it needs to get cleared
    set(prevTimeoutAtom, nextTimeoutId)
  })

  const currentValueAtom = atom(
    (get) => get(_currentValueAtom),
    (_get, set, update: SetStateAction<T>) => {
      set(skipDebounceAtom, true) // set the flag to skip debounce
      set(_currentValueAtom, update)
      set(debouncedValueAtom, update)
    }
  )

  const clearTimeoutAtom = atom(null, (get, set, _arg) => {
    clearTimeout(get(prevTimeoutAtom))
    set(isDebouncingAtom, false)
  })

  return {
    currentValueAtom,
    isDebouncingAtom,
    clearTimeoutAtom,
    debouncedValueAtom
  }
}
