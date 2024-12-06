import { AnimatePresence, m } from 'framer-motion'
import { useAtom } from 'jotai'

import { Project } from '@campsite/types'
import { cn } from '@campsite/ui/utils'

import { BreadcrumbProjectCallButton } from '@/components/Projects/ProjectCallButton'
import { ProjectOverflowMenu } from '@/components/Projects/ProjectOverflowMenu'
import { ProjectSidebarAbout } from '@/components/Projects/ProjectSidebar/ProjectSidebarAbout'
import { ProjectSidebarBookmarks } from '@/components/Projects/ProjectSidebar/ProjectSidebarBookmarks'
import { ProjectSidebarMembers } from '@/components/Projects/ProjectSidebar/ProjectSidebarMembers'
import { ProjectSidebarNotifications } from '@/components/Projects/ProjectSidebar/ProjectSidebarNotifications'
import {
  ProjectSidebarDesktopToggleButton,
  ProjectSidebarMobileToggleButton
} from '@/components/Projects/ProjectSidebar/ProjectSidebarToggleButton'
import { isMobileProjectSidebarOpenAtom, PROJECT_DETAILS_WIDTH } from '@/components/Projects/utils'
import { BreadcrumbLabel, BreadcrumbTitlebar } from '@/components/Titlebar/BreadcrumbTitlebar'

interface ProjectSidebarProps {
  project: Project
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
  return (
    <div className='flex h-full flex-col overflow-hidden' style={{ minWidth: PROJECT_DETAILS_WIDTH }}>
      <BreadcrumbTitlebar className='bg-elevated flex justify-between lg:hidden' hideSidebarToggle>
        <BreadcrumbLabel>{project.name}</BreadcrumbLabel>
        <ProjectSidebarMobileToggleButton />
      </BreadcrumbTitlebar>

      <BreadcrumbTitlebar className='flex justify-end max-lg:hidden'>
        <BreadcrumbProjectCallButton project={project} />
        <ProjectOverflowMenu type='dropdown' project={project} size='sm' />
        <ProjectSidebarDesktopToggleButton />
      </BreadcrumbTitlebar>

      <div className='pb-safe flex flex-1 flex-col overflow-y-auto'>
        <ProjectSidebarAbout project={project} />
        {!project.personal && <ProjectSidebarMembers project={project} />}
        <ProjectSidebarBookmarks project={project} />
        {!project.personal && <ProjectSidebarNotifications project={project} />}
      </div>
    </div>
  )
}

export function ProjectMobileSidebar({ project }: ProjectSidebarProps) {
  const [isMobileProjectSidebarOpen, setIsMobileProjectSidebarOpen] = useAtom(isMobileProjectSidebarOpenAtom)

  return (
    <>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isMobileProjectSidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn('fixed inset-0 z-20 bg-black bg-opacity-20 lg:hidden dark:bg-opacity-50', {
          'pointer-events-none': !isMobileProjectSidebarOpen
        })}
        onClick={() => setIsMobileProjectSidebarOpen((prev) => !prev)}
      />

      <AnimatePresence initial={false}>
        {isMobileProjectSidebarOpen && (
          <m.div
            initial={{ width: 0 }}
            animate={{ width: PROJECT_DETAILS_WIDTH }}
            exit={{ width: 0 }}
            transition={{ duration: 0.1 }}
            className='bg-elevated fixed bottom-0 right-0 top-0 z-20 lg:hidden'
          >
            <ProjectSidebar project={project} />
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
