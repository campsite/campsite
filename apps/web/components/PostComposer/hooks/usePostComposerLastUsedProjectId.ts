import { useAtom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { useScope } from '@/contexts/scope'
import { atomWithWebStorage } from '@/utils/atomWithWebStorage'

const lastUsedProjectIdAtomFamily = atomFamily((scope: string) =>
  atomWithWebStorage<string | null>(`projects:last-used:${scope}`, null)
)

function usePostComposerLastUsedProjectId() {
  const { scope } = useScope()
  const [lastUsedProjectId, setLastUsedProjectId] = useAtom(lastUsedProjectIdAtomFamily(`${scope}`))

  return { lastUsedProjectId, setLastUsedProjectId }
}

export { usePostComposerLastUsedProjectId }
