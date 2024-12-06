import { useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'

import { Post, Project } from '@campsite/types'
import { cn, Command, LazyLoadingSpinner, Link, ProjectIcon, UIText } from '@campsite/ui'
import { HoverCard } from '@campsite/ui/src/HoverCard'

import { CompactPost } from '@/components/CompactPost/CompactPost'
import { NewProjectPostButton } from '@/components/Projects/NewProjectPostButton'
import { ProjectFavoriteButton } from '@/components/Projects/ProjectFavoriteButton'
import { ThreadView } from '@/components/ThreadView'
import { useScope } from '@/contexts/scope'
import { filterAtom as postFilterAtom, sortAtom as postSortAtom } from '@/hooks/useGetPostsIndex'
import { useGetProjectPosts } from '@/hooks/useGetProjectPosts'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { getGroupDateHeading } from '@/utils/getGroupDateHeading'
import { groupByDate } from '@/utils/groupByDate'

import { EmptyState } from '../EmptyState'
import { sidebarCollapsedAtom } from '../Layout/AppLayout'
import { ProjectAccessory } from './ProjectAccessory'

interface ProjectHoverCardProps extends React.PropsWithChildren {
  project: Project
  disabled?: boolean
}

export function ProjectHoverCard({ project, children, disabled }: ProjectHoverCardProps) {
  const router = useRouter()
  const { scope } = useScope()
  const [open, setOpen] = useState(false)
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)
  const isViewingProject = project.id === router.query.projectId
  const isDisabled = sidebarCollapsed || isViewingProject || disabled
  const href = `/${scope}/projects/${project.id}`

  const handleOpenChange = (newVal: boolean) => {
    setOpen(newVal)
  }

  return (
    <HoverCard open={open} onOpenChange={handleOpenChange} disabled={isDisabled} targetHref={href}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Content sideOffset={4} alignOffset={-44}>
        <HoverCard.Content.TitleBar>
          <Link href={href} onClick={() => handleOpenChange(false)} className='flex flex-1 items-center gap-1 px-1'>
            <ProjectAccessory project={project} />

            <UIText weight='font-semibold' className='break-anywhere'>
              {project.name}
            </UIText>

            <ProjectFavoriteButton project={project} />
          </Link>
          {!project.message_thread_id && (
            <NewProjectPostButton projectId={project.id} onClick={() => handleOpenChange(false)} />
          )}
        </HoverCard.Content.TitleBar>

        {project.message_thread_id ? (
          <ThreadView threadId={project.message_thread_id} placement='hovercard' />
        ) : (
          <ProjectPosts project={project} open={open} />
        )}
      </HoverCard.Content>
    </HoverCard>
  )
}

function ProjectPosts({ project, open }: { project: Project; open: boolean }) {
  const { scope } = useScope()
  const filter = useAtomValue(postFilterAtom({ scope }))
  const sort = useAtomValue(postSortAtom({ scope, filter }))
  const getPosts = useGetProjectPosts({
    projectId: project.id,
    order: { by: sort, direction: 'desc' },
    enabled: open || project.unread_for_viewer
  })
  const groupedPosts = useMemo(
    () => groupByDate(flattenInfiniteData(getPosts.data) || [], (post) => post[sort] || post.created_at),
    [getPosts.data, sort]
  )
  const hasPosts = !!Object.keys(groupedPosts).length

  if (hasPosts) return <PostsList groupedPosts={groupedPosts} />

  if (getPosts.isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center px-6 py-12'>
        <LazyLoadingSpinner />
      </div>
    )
  }

  return (
    <div className='flex flex-1 items-center justify-center px-6 py-12'>
      <EmptyState title='No posts' icon={<ProjectIcon className='text-quaternary' size={32} />} />
    </div>
  )
}

interface PostsListProps {
  groupedPosts: Record<string, Post[]>
}

function PostsList({ groupedPosts }: PostsListProps) {
  return (
    <Command className='scrollbar-hide flex max-h-[420px] flex-col gap-px overflow-y-auto overscroll-contain'>
      <Command.List>
        {Object.entries(groupedPosts).map(([date, posts], i) => {
          const dateHeading = getGroupDateHeading(date)

          return (
            <div key={date} className='flex flex-col'>
              <div
                className={cn('bg-primary sticky top-0 z-10 border-b px-3 py-1.5', {
                  'mt-4': i !== 0
                })}
              >
                <UIText weight='font-medium' tertiary>
                  {dateHeading}
                </UIText>
              </div>

              <div className='p-2'>
                {posts.map((post) => (
                  <div key={post.id} className='hover:bg-tertiary rounded-lg'>
                    <CompactPost post={post} hideProject />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </Command.List>
    </Command>
  )
}
