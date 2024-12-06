import { useScope } from '@/contexts/scope'

import { useStoredState } from './useStoredState'

export function useScopedStorage<T>(key: string, initialValue: T) {
  const { scope } = useScope()

  return useStoredState(`${scope}:${key}`, initialValue)
}
