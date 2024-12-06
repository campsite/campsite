import { atom } from 'jotai'

export interface OptimisticState<T> {
  status: 'pending' | 'error'
  data: T
}

export function createRetryAtoms<T>() {
  const createAtom = atom<Record<string, OptimisticState<T> | undefined>>({})
  const setStateAtom = atom(
    null,
    (_get, set, { optimisticId, state }: { optimisticId: string; state: OptimisticState<T> }) => {
      set(createAtom, (prev) => {
        return { ...prev, [optimisticId]: state }
      })
    }
  )
  const updateStateAtom = atom(
    null,
    (_get, set, { optimisticId, status }: { optimisticId: string; status: OptimisticState<T>['status'] }) => {
      set(createAtom, (prev) => {
        const prevState = prev[optimisticId]

        if (!prevState) return prev
        const { status: _, ...rest } = prevState

        return {
          ...prev,
          ...{ [optimisticId]: { status, ...rest } }
        }
      })
    }
  )
  const removeStateAtom = atom(null, (_get, set, { optimisticId }: { optimisticId: string }) => {
    set(createAtom, (prev) => {
      const { [optimisticId]: _, ...rest } = prev

      return rest
    })
  })

  return {
    createAtom,
    setStateAtom,
    updateStateAtom,
    removeStateAtom
  }
}
