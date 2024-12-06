import { createContext, PropsWithChildren, useCallback, useContext, useState } from 'react'
import Router from 'next/router'

const HistoryContext = createContext({
  initialKey: ''
})

export function HistoryProvider({ children }: PropsWithChildren<unknown>) {
  const [initialKey] = useState(() => {
    if (typeof window === 'undefined') return ''
    return window.history.state?.key || ''
  })

  return <HistoryContext.Provider value={initialKey}>{children}</HistoryContext.Provider>
}

interface GoBackOptions {
  fallbackPath?: string
  nativeOverride?: () => void
}

export function useGoBack() {
  const initialKey = useContext(HistoryContext)

  return useCallback(
    (options?: GoBackOptions) => {
      if (window.history.state?.key === initialKey) {
        Router.push(options?.fallbackPath ?? '/')
      } else {
        ;(options?.nativeOverride ?? Router.back)()
      }
    },
    [initialKey]
  )
}
