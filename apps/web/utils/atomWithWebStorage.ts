import { atom } from 'jotai'
import { RESET } from 'jotai/utils'

import { getFromStorage } from './getFromStorage'
import { setToStorageWithDefault } from './setToStorageWithDefault'

export function atomWithWebStorage<T>(
  key: string | string[],
  initialValue: T,
  storage = typeof window !== 'undefined' ? window.localStorage : undefined
) {
  const storageKey = typeof key === 'string' ? key : key.join(':')
  const baseAtom = atom(getFromStorage(storage, storageKey, initialValue))

  return atom(
    (get) => get(baseAtom),
    (_get, set, next: T | typeof RESET) => {
      const nextValue = next === RESET ? initialValue : next

      setToStorageWithDefault(storage, storageKey, nextValue, initialValue)
      set(baseAtom, nextValue)
    }
  )
}
