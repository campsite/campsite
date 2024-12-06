import { useState } from 'react'
import * as HoverCard from '@radix-ui/react-hover-card'

import { cn, CONTAINER_STYLES, Link, LoadingSpinner, LockIcon, UIText } from '@campsite/ui'

import { ProjectSubscriptionButton } from '@/components/Projects/ProjectSubscriptionButton'
import { useScope } from '@/contexts/scope'
import { useGetProject } from '@/hooks/useGetProject'

import { ProjectFavoriteButton } from '../Projects/ProjectFavoriteButton'
import { ProjectMembershipButton } from '../Projects/ProjectMembershipButton'

export function ProjectHovercard({
  projectId,
  children,
  side = 'bottom',
  align = 'start',
  sideOffset = 4
}: {
  projectId?: string
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}) {
  const { scope } = useScope()
  const [open, setOpen] = useState(false)
  const getProject = useGetProject({ id: projectId, enabled: open })
  const project = getProject.data

  if (!projectId) return null

  return (
    <HoverCard.Root open={open} onOpenChange={setOpen} openDelay={200} closeDelay={200}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          hideWhenDetached
          side={side}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={8}
          className={cn(
            'border-primary-opaque bg-elevated w-[312px] origin-[--radix-hover-card-content-transform-origin] overflow-hidden rounded-lg border p-3 shadow max-md:hidden dark:shadow-[0px_0px_0px_0.5px_rgba(0,0,0,1),_0px_4px_4px_rgba(0,0,0,0.24)]',
            CONTAINER_STYLES.animation
          )}
        >
          {project && (
            <div className='flex'>
              <Link href={`/${scope}/projects/${project.id}`} className='before:absolute before:inset-0 before:z-0' />
              <div className='flex flex-1 flex-col justify-center gap-1.5'>
                <div className='flex items-center gap-1.5'>
                  {project.accessory && (
                    <div className='flex h-5 w-5 items-center justify-center font-["emoji"] text-base'>
                      {project.accessory}
                    </div>
                  )}
                  <UIText weight='font-medium' className='break-words text-[15px]'>
                    {project.name}
                  </UIText>
                  {project.private && (
                    <span className='flex-none'>
                      <LockIcon size={18} />
                    </span>
                  )}
                </div>
                {project.description && (
                  <div className='-mt-0.5 line-clamp-2 flex-1 whitespace-pre-wrap'>
                    <UIText tertiary>{project.description}</UIText>
                  </div>
                )}
                <div className='mt-2 flex items-center justify-end gap-1 self-start'>
                  <ProjectMembershipButton project={project} joinVariant='primary' className='w-18' />
                  <ProjectSubscriptionButton project={project} />
                  <ProjectFavoriteButton project={project} />
                </div>
              </div>
            </div>
          )}
          {!project && (
            <div className='flex items-center justify-center p-6'>
              <LoadingSpinner />
            </div>
          )}
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
