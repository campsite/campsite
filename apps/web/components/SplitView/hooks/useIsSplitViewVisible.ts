import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'

import { isDesktopProjectSidebarOpenAtom } from '@/components/Projects/utils'
import { debouncedSelectedSplitViewSubjectAtom } from '@/components/SplitView/utils'

export function useIsSplitViewVisible() {
  const router = useRouter()
  const isProject =
    router.pathname === '/[org]/projects/[projectId]' ||
    router.pathname === '/[org]/projects/[projectId]/docs' ||
    router.pathname === '/[org]/projects/[projectId]/calls'
  const isDesktopProjectSidebarOpen = useAtomValue(isDesktopProjectSidebarOpenAtom)
  const debouncedSelectedSplitViewSubject = useAtomValue(debouncedSelectedSplitViewSubjectAtom)

  return { isSplitViewVisible: (isProject && isDesktopProjectSidebarOpen) || !!debouncedSelectedSplitViewSubject }
}
