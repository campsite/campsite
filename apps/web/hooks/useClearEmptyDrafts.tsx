import { useEffect } from 'react'
import deepEqual from 'fast-deep-equal'

import { EMPTY_HTML, EMPTY_JSON } from '@/atoms/markdown'

const clearEmptyDrafts = (storage?: Storage) => {
  if (!storage) return

  if (storage.getItem('emptyDraftsScanned') === 'true') {
    return
  }

  Object.keys(storage).forEach((key) => {
    const value = storage.getItem(key)

    try {
      if (value === EMPTY_HTML) {
        storage.removeItem(key)
      } else if (value) {
        const parsed = JSON.parse(value)

        if (parsed === EMPTY_HTML || deepEqual(parsed, EMPTY_JSON)) {
          storage.removeItem(key)
        }
      }
    } catch {
      // no-op
    }
  })

  storage.setItem('emptyDraftsScanned', 'true')
}

export function useClearEmptyDrafts() {
  useEffect(() => {
    clearEmptyDrafts(localStorage)
    clearEmptyDrafts(sessionStorage)
  }, [])
}
