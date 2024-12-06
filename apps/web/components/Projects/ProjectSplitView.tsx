import { useAtomValue } from 'jotai'

import { Project } from '@campsite/types/generated'

import { ProjectSidebar } from '@/components/Projects/ProjectSidebar'
import { isDesktopProjectSidebarOpenAtom, PROJECT_DETAILS_WIDTH } from '@/components/Projects/utils'
import { SplitViewDetail } from '@/components/SplitView'

interface ProjectSplitViewProps {
  project: Project
}

export function ProjectSplitView({ project }: ProjectSplitViewProps) {
  const isDesktopProjectSidebarOpen = useAtomValue(isDesktopProjectSidebarOpenAtom)

  return (
    <SplitViewDetail
      fallback={isDesktopProjectSidebarOpen ? <ProjectSidebar project={project} /> : null}
      fallbackWidth={`${PROJECT_DETAILS_WIDTH}px`}
    />
  )
}
