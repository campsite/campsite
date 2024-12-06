import { useState } from 'react'

import { Project } from '@campsite/types/generated'
import { UIText } from '@campsite/ui/Text'

import { ProjectEditDialog } from '@/components/Projects/ProjectDialogs/ProjectEditDialog'

interface ProjectSidebarAboutProps {
  project: Project
}

export function ProjectSidebarAbout({ project }: ProjectSidebarAboutProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  return (
    <>
      <ProjectEditDialog project={project} open={editDialogOpen} onOpenChange={setEditDialogOpen} />

      <div className='group flex w-full flex-col'>
        <div className='flex flex-col gap-3 border-b px-4 py-4'>
          <div className='flex items-center justify-between'>
            <UIText size='text-xs' tertiary weight='font-medium'>
              About
            </UIText>
            {project.description && (
              <button
                onClick={() => setEditDialogOpen(true)}
                className='text-tertiary hover:text-primary opacity-0 group-hover:opacity-100'
              >
                <UIText size='text-xs' inherit weight='font-medium'>
                  Edit
                </UIText>
              </button>
            )}
          </div>
          {project.description && (
            <UIText secondary selectable className='whitespace-pre-wrap'>
              {project.description}
            </UIText>
          )}
          {!project.description && (
            <button
              className='text-left'
              onClick={() => {
                if (project.viewer_can_update) setEditDialogOpen(true)
              }}
            >
              <UIText quaternary>Add a description...</UIText>
            </button>
          )}
        </div>
      </div>
    </>
  )
}
