import { useRouter } from 'next/router'

import { usePostComposerLastUsedProjectId } from '@/components/PostComposer/hooks/usePostComposerLastUsedProjectId'
import { useIsChatProjectRoute } from '@/hooks/useIsChatProjectRoute'

export function useDefaultComposerValues() {
  const routerProjectId = useRouter().query.projectId as string | undefined
  const { isChatProject } = useIsChatProjectRoute()

  const { lastUsedProjectId } = usePostComposerLastUsedProjectId()

  return {
    defaultProjectId: (!isChatProject && routerProjectId) || lastUsedProjectId || undefined
  }
}
