import { useRouter } from 'next/router'

import { useSyncedProjects } from '@/hooks/useSyncedProjects'

export function useIsChatProjectRoute() {
  const routerProjectId = useRouter().query.projectId as string | undefined
  const { projects } = useSyncedProjects({ includeProjectId: routerProjectId })
  const routerProject = projects.find((project) => project.id === routerProjectId)

  return { isChatProject: !!routerProject && !!routerProject.message_thread_id }
}
