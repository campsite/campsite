import React from 'react'
import { useAtomValue } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { useCurrentUserIsStaff } from '@/hooks/useCurrentUserIsStaff'

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then((d) => ({
    default: d.ReactQueryDevtools
  }))
)

export const enableDevToolsAtom = atomWithStorage('enable-dev-tools', false)

export function StaffDevTools() {
  const isStaff = useCurrentUserIsStaff()
  const enabled = useAtomValue(enableDevToolsAtom)

  if (!isStaff || !enabled) return null

  return (
    <React.Suspense fallback={null}>
      <ReactQueryDevtoolsProduction />
    </React.Suspense>
  )
}
