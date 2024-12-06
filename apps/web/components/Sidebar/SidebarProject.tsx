import { useState } from 'react'
import { useRouter } from 'next/router'

import { Project } from '@campsite/types'
import { ConditionalWrap } from '@campsite/ui/utils'

import { ProjectOverflowMenu } from '@/components/Projects/ProjectOverflowMenu'
import { useScope } from '@/contexts/scope'
import { scrollImmediateScrollableNodeToTop } from '@/utils/scroll'

import { ProjectAccessory } from '../Projects/ProjectAccessory'
import { ProjectHoverCard } from '../Projects/ProjectHoverCard'
import { PROJECT_PAGE_SCROLL_CONTAINER_ID } from '../Projects/utils'
import { SidebarLink } from './SidebarLink'

export function SidebarProject({
  project,
  onRemove,
  removeTooltip,
  isDragging
}: {
  project: Project
  location: 'favorites' | 'projects'
  onRemove?: () => void
  removeTooltip?: string
  isDragging?: boolean
}) {
  const router = useRouter()
  const { scope } = useScope()
  const [contextMenuOpen, setContextMenuOpen] = useState(false)

  const href = `/${scope}/projects/${project.id}`
  const isActive = router.asPath.startsWith(href)
  let label = project.name

  if (project.archived) {
    label = `${label} (Archived)`
  }

  const unread = project.unread_for_viewer

  return (
    <ProjectOverflowMenu type='context' project={project} onOpenChange={setContextMenuOpen}>
      <span>
        <ConditionalWrap
          condition={!contextMenuOpen}
          wrap={(children) => (
            <ProjectHoverCard project={project} disabled={isDragging}>
              {children}
            </ProjectHoverCard>
          )}
        >
          <SidebarLink
            id={project.id}
            key={project.id}
            href={`/${scope}/projects/${project.id}`}
            label={label}
            unread={unread}
            isPrivate={project.private}
            active={isActive || contextMenuOpen}
            onRemove={onRemove}
            removeTooltip={removeTooltip}
            onClick={() => {
              if (isDragging) return

              if (isActive) {
                scrollImmediateScrollableNodeToTop(document.getElementById(PROJECT_PAGE_SCROLL_CONTAINER_ID))
              }
            }}
            leadingAccessory={<ProjectAccessory project={project} />}
          />
        </ConditionalWrap>
      </span>
    </ProjectOverflowMenu>
  )
}
