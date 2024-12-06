import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CookieValueTypes, setCookie } from 'cookies-next'
import Router, { useRouter } from 'next/router'

import { SCOPE_COOKIE_NAME } from '@campsite/config'

interface State {
  scope: CookieValueTypes | undefined
  setScope: (scope: CookieValueTypes) => void
}
interface ScopeProviderProps {
  children: React.ReactNode
}

const ScopeContext = createContext<State | undefined>(undefined)

export function scopePathCookieName(scope: CookieValueTypes) {
  return `last-path:${scope}`
}

export const allowedSavedScopePaths = ['chat', 'inbox', 'notes', 'people', 'posts', 'projects', 'search', 'calls']
export const disallowedScopePaths = ['calls/join']

function setScopeCookies(scope: CookieValueTypes, path: string) {
  if (!scope) return

  setCookie(SCOPE_COOKIE_NAME, scope, {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' ? true : false,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365) // 1 year
  })

  const isPathInAllowedScopePaths = allowedSavedScopePaths.some((p) => path.startsWith(`/${scope}/${p}/`))
  const isPathInDisallowedScopePaths = disallowedScopePaths.some((p) => path.startsWith(`/${scope}/${p}/`))

  const savedPath = isPathInAllowedScopePaths && !isPathInDisallowedScopePaths ? path : ''

  setCookie(scopePathCookieName(scope), savedPath, {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' ? true : false,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 6) // 6 hours
  })
}

function ScopeProvider({ children }: ScopeProviderProps) {
  const router = useRouter()
  const org = router.query.org as string
  const [scope, setScope] = useState<CookieValueTypes>(org)

  useEffect(() => {
    // router.query is an empty object on the first render
    // wait til the router is ready, at which point the router.query
    // will be populated with any query params in the url
    if (router.isReady) {
      if (typeof org === 'string') {
        setScopeCookies(org, router.asPath)
        setScope(org)
      }
    }
  }, [org, router.asPath, router.isReady])

  const handleSetScope = useCallback((slug: CookieValueTypes) => {
    setScopeCookies(slug, Router.asPath)
    setScope(slug)
  }, [])

  const activeScope = org || scope
  const value = useMemo(() => ({ setScope: handleSetScope, scope: activeScope }), [activeScope, handleSetScope])

  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>
}

function useScope() {
  const context = useContext(ScopeContext)

  if (context === undefined) {
    throw new Error('useScope must be used within a ScopeProvider')
  }

  return context
}

export { ScopeProvider, useScope }
