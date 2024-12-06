import { useRouter } from 'next/router'

import { useBreakpoint } from '@campsite/ui/hooks'

import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { useIsChatProjectRoute } from '@/hooks/useIsChatProjectRoute'
import { usePostsDisplayPreference } from '@/hooks/usePostsDisplayPreference'

export function useIsSplitViewAvailable() {
  const router = useRouter()
  const isLg = useBreakpoint('lg')
  const { isChatProject } = useIsChatProjectRoute()
  const displayPreference = usePostsDisplayPreference()
  const hasComfyCompactLayout = useCurrentUserOrOrganizationHasFeature('comfy_compact_layout')

  const isComfortable =
    !hasComfyCompactLayout &&
    displayPreference === 'comfortable' &&
    (router.pathname === '/[org]/projects/[projectId]' || router.pathname === '/[org]/posts')
  const isProject =
    router.pathname === '/[org]/projects/[projectId]' ||
    router.pathname === '/[org]/projects/[projectId]/docs' ||
    router.pathname === '/[org]/projects/[projectId]/calls'
  const isCalls = router.pathname === '/[org]/calls'
  const isNotes = router.pathname === '/[org]/notes'
  const isPosts = router.pathname === '/[org]/posts'
  const isValidRoute = (() => {
    if (isComfortable || isChatProject) return false
    return isProject || isCalls || isNotes || isPosts
  })()

  return { isSplitViewAvailable: isLg && isValidRoute }
}
