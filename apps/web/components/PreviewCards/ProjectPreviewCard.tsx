import { cn, Link, LockIcon, ProjectIcon, UIText } from '@campsite/ui'

import { ProjectFavoriteButton } from '@/components/Projects/ProjectFavoriteButton'
import { ProjectMembershipButton } from '@/components/Projects/ProjectMembershipButton'
import { ProjectSubscriptionButton } from '@/components/Projects/ProjectSubscriptionButton'
import { useScope } from '@/contexts/scope'
import { useGetProject } from '@/hooks/useGetProject'

import { InlineProjectTombstone } from '../InlinePost/Tombstone'

interface Props {
  className?: string
  projectId: string
  interactive?: boolean
}

export function ProjectPreviewCard({ className, projectId, interactive }: Props) {
  const { scope } = useScope()
  const { data: project, isError } = useGetProject({ id: projectId })

  if (isError) {
    return <InlineProjectTombstone />
  }

  if (!project) {
    return (
      <div
        className={cn(
          'bg-primary dark:bg-secondary relative min-h-24 w-full overflow-hidden rounded-lg border',
          className
        )}
      />
    )
  }

  return (
    <div className='bg-elevated group/project-preview relative flex w-full flex-col items-start self-start overflow-hidden rounded-lg border p-3 sm:flex-row'>
      {interactive && <Link href={`/${scope}/projects/${project.id}`} className='absolute inset-0 z-0' />}

      <div className='flex flex-1 items-center gap-2'>
        <span className='h-7.5 w-7.5 relative flex items-center justify-center self-start'>
          {project.accessory ? (
            <UIText className='font-["emoji"] text-[17px]'>{project.accessory}</UIText>
          ) : (
            <ProjectIcon size={24} className='text-tertiary' />
          )}
        </span>

        <div className='flex-1 flex-col'>
          <div className='not-prose flex items-center gap-1.5'>
            <UIText weight='font-medium' size='text-[15px]' className='line-clamp-1'>
              {project.name}
            </UIText>

            {project.private && (
              <div className='text-quaternary h-5.5 w-5.5 flex items-center justify-center'>
                <LockIcon size={16} strokeWidth='2' />
              </div>
            )}

            <div
              className={cn(
                'flex min-h-7 items-center justify-center group-hover/project-preview:opacity-100 group-has-[button[aria-expanded="true"]]/project-preview:opacity-100',
                {
                  'opacity-100': project.viewer_has_favorited,
                  'opacity-0': !project.viewer_has_favorited
                }
              )}
            >
              <ProjectFavoriteButton project={project} />
            </div>
          </div>

          {project.description && (
            <UIText className='line-clamp-2 max-w-[80%] whitespace-pre-wrap' secondary>
              {project.description}
            </UIText>
          )}
        </div>
      </div>

      {interactive && (
        <div
          className={cn(
            'ml-1 mt-2 sm:ml-0 sm:mt-0',
            'flex flex-none flex-row-reverse items-center justify-end gap-1 sm:flex-row'
          )}
        >
          <ProjectSubscriptionButton project={project} />
          <ProjectMembershipButton project={project} className='w-full sm:w-fit' />
        </div>
      )}
    </div>
  )
}
