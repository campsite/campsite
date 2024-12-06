import { useCallback, useEffect, useMemo, useState } from 'react'
import { InfiniteLoader } from 'components/InfiniteLoader'
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMilliseconds,
  subMonths,
  subWeeks
} from 'date-fns'
import { useGetProjects } from 'hooks/useGetProjects'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useRouter } from 'next/router'

import { Project, SyncCustomReaction } from '@campsite/types'
import { Button, Link, LockIcon, ProjectIcon, UIText } from '@campsite/ui'
import { cn } from '@campsite/ui/src/utils'

import {
  IndexPageContainer,
  IndexPageContent,
  IndexPageEmptyState,
  IndexPageLoading
} from '@/components/IndexPages/components'
import { CreateProjectDialog } from '@/components/Projects/Create/CreateProjectDialog'
import { ProjectMembershipButton } from '@/components/Projects/ProjectMembershipButton'
import { ProjectsIndexSearch } from '@/components/Projects/ProjectsIndexSearch'
import { MobileProjectsIndexTitlebar, ProjectsIndexTitlebar } from '@/components/Projects/ProjectsIndexTitlebar'
import { ReactionPicker } from '@/components/Reactions/ReactionPicker'
import { useScope } from '@/contexts/scope'
import { useCanHover } from '@/hooks/useCanHover'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGroupedListNavigation } from '@/hooks/useListNavigation'
import { useUpdateProject } from '@/hooks/useUpdateProject'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { isStandardReaction, StandardReaction } from '@/utils/reactions'

import { ProjectFavoriteButton } from './ProjectFavoriteButton'
import { ProjectOverflowMenu } from './ProjectOverflowMenu'
import { ProjectSubscriptionButton } from './ProjectSubscriptionButton'

export const searchAtom = atom<string>('')
export const PROJECTS_LIST_NAVIGATION_CONTAINER_ID = 'projects-list'

const lastUsedProjectIdAtom = atom<string | null>(null)

function getProjectDOMId(project: Project) {
  return `project-${project.id}`
}

export function ProjectsIndex() {
  const router = useRouter()
  const query = useAtomValue(searchAtom)
  const isArchived = router.pathname === '/[org]/projects/archived'
  const getProjects = useGetProjects({ archived: isArchived, query })
  const projects = useMemo(() => flattenInfiniteData(getProjects.data) || [], [getProjects.data])
  const hasProjects = !!projects?.length
  const isInitialLoading = getProjects.isLoading

  return (
    <>
      <IndexPageContainer>
        <ProjectsIndexTitlebar />
        <MobileProjectsIndexTitlebar />
        <ProjectsIndexSearch />

        <IndexPageContent className='max-w-3xl'>
          {isInitialLoading && <IndexPageLoading />}
          {!isInitialLoading && !hasProjects && (
            <ProjectsIndexEmptyState
              title={query ? 'No channels found' : isArchived ? 'No archived channels' : 'No channels yet'}
              isArchived={isArchived}
            />
          )}

          {projects.length === 1 && projects[0].is_general && !isArchived && (
            <div>
              <ProjectsIndexEmptyState title='Set up your channels' isArchived={false} />
            </div>
          )}

          {!isInitialLoading && hasProjects && <ProjectsIndexContent projects={projects} />}

          <InfiniteLoader
            hasNextPage={!!getProjects.hasNextPage}
            isError={!!getProjects.isError}
            isFetching={!!getProjects.isFetching}
            isFetchingNextPage={!!getProjects.isFetchingNextPage}
            fetchNextPage={getProjects.fetchNextPage}
          />
        </IndexPageContent>
      </IndexPageContainer>
    </>
  )
}

interface GroupedProjects {
  label: string
  startDate: Date
  endDate: Date
  projects: Project[]
}

const groupProjectsByDate = (items: Project[]): Record<string, Project[]> => {
  const today = new Date().setHours(0, 0, 0, 0)
  const startOfToday = startOfDay(today)
  const endOfToday = endOfDay(today)
  const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 })
  const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 })
  const startOfLastWeek = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
  // one ms before the start of this week
  const endOfLastWeek = subMilliseconds(startOfThisWeek, 1)
  const startOfThisMonth = startOfMonth(today)
  const endOfThisMonth = endOfMonth(today)
  const startOfLastMonth = startOfMonth(subMonths(today, 1))
  // one ms before the start of this month
  const endOfLastMonth = subMilliseconds(startOfThisMonth, 1)

  const groups: GroupedProjects[] = [
    { label: 'Today', startDate: startOfToday, endDate: endOfToday, projects: [] },
    { label: 'This Week', startDate: startOfThisWeek, endDate: endOfThisWeek, projects: [] },
    { label: 'Last Week', startDate: startOfLastWeek, endDate: endOfLastWeek, projects: [] },
    { label: 'This Month', startDate: startOfThisMonth, endDate: endOfThisMonth, projects: [] },
    { label: 'Last Month', startDate: startOfLastMonth, endDate: endOfLastMonth, projects: [] },
    {
      label: 'Older',
      startDate: new Date(0),
      endDate: new Date(startOfLastMonth.getTime() - 1),
      projects: []
    }
  ]

  items.forEach((item) => {
    const lastActiveAt = new Date(item.last_activity_at)
    const group = groups.find((g) => lastActiveAt >= g.startDate && lastActiveAt <= g.endDate)

    group?.projects.push(item)
  })

  const filtered = groups.filter((group) => group.projects.length > 0)
  const result = {} as Record<string, Project[]>

  filtered.forEach((group) => {
    result[group.label] = group.projects
  })

  return result
}

function ProjectsIndexContent({ projects }: { projects: Project[] }) {
  const groups = useMemo(() => groupProjectsByDate(projects), [projects])

  const [lastUsedProjectId, setLastUsedProjectId] = useAtom(lastUsedProjectIdAtom)

  const { selectItem } = useGroupedListNavigation({
    initialActiveItemId: lastUsedProjectId ?? undefined,
    groups: groups || [],
    getItemDOMId: getProjectDOMId
  })

  // reset lastUsedPostId when the component unmounts
  useEffect(() => {
    return () => setLastUsedProjectId(null)
  }, [setLastUsedProjectId])

  return (
    <>
      {Object.entries(groups).map(([date, projects], groupIndex) => (
        <div key={date} id={PROJECTS_LIST_NAVIGATION_CONTAINER_ID} className='flex flex-col'>
          <div className='border-b py-2'>
            <UIText weight='font-medium' tertiary>
              {date === 'Today' ? 'Active today' : date}
            </UIText>
          </div>
          <ul className='-mx-2 mt-2 flex flex-col'>
            {projects.map((project, itemIndex) => (
              <ProjectIndexRow
                key={project.id}
                project={project}
                onFocus={() => selectItem({ itemIndex, groupIndex })}
                onPointerMove={() => selectItem({ itemIndex, groupIndex, scroll: false })}
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

function ProjectsIndexEmptyState({ isArchived, title }: { isArchived: boolean; title: string }) {
  const query = useAtomValue(searchAtom)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { data: organization } = useGetCurrentOrganization()

  return (
    <IndexPageEmptyState>
      <ProjectIcon size={32} />

      <div className='flex flex-col gap-1'>
        <UIText size='text-base' weight='font-semibold'>
          {title}
        </UIText>
        <UIText size='text-base' tertiary>
          {query
            ? 'Try another search or create a new channel.'
            : isArchived
              ? "New posts can't be added to archived channels, but all previous posts will still be visible. Archived channels can be unarchived at any time."
              : 'Channels keep your team’s posts organized. Use them to group conversations by project, team, or topic.'}
        </UIText>
      </div>

      {organization?.viewer_can_see_new_project_button && (
        <div className='flex items-center justify-center'>
          <CreateProjectDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onCreate={() => setCreateDialogOpen(false)}
          />
          <Button variant='flat' onClick={() => setCreateDialogOpen(true)}>
            New channel
          </Button>
        </div>
      )}
    </IndexPageEmptyState>
  )
}

function ProjectIndexRow({
  project,
  onFocus,
  onPointerMove
}: {
  project: Project
  onFocus?: React.FocusEventHandler<HTMLAnchorElement>
  onPointerMove?: React.PointerEventHandler<HTMLAnchorElement>
}) {
  const { scope } = useScope()
  const canHover = useCanHover()
  const updateProject = useUpdateProject(project.id)

  const handleReactionSelect = useCallback(
    (reaction: StandardReaction | SyncCustomReaction) => {
      if (!isStandardReaction(reaction)) return

      updateProject.mutate({ accessory: reaction.native })
    },
    [updateProject]
  )

  return (
    <ProjectOverflowMenu type='context' project={project}>
      <li
        className={cn(
          '[&:has(button[aria-expanded="true"])]:bg-tertiary group relative flex flex-col gap-3 rounded-md py-2.5 pl-2 pr-1.5 sm:flex-row sm:items-center lg:py-2',
          'data-[state="open"]:bg-tertiary',
          {
            'focus-within:bg-tertiary': canHover
          }
        )}
      >
        <Link
          id={getProjectDOMId(project)}
          href={`/${scope}/projects/${project.id}`}
          className='absolute inset-0 z-0 focus:ring-0'
          onFocus={onFocus}
          onPointerMove={onPointerMove}
        />

        <div className='flex flex-1 items-center gap-2'>
          <ReactionPicker
            trigger={
              <button className='h-7.5 w-7.5 relative flex cursor-pointer items-center justify-center self-start rounded-md font-["emoji"] text-base hover:bg-black/[0.08] dark:hover:bg-white/[0.08]'>
                {project.accessory ? (
                  <UIText className='font-["emoji"] text-[17px]'>{project.accessory}</UIText>
                ) : (
                  <ProjectIcon className='text-tertiary' />
                )}
              </button>
            }
            onReactionSelect={handleReactionSelect}
          />

          <div className='flex-1 flex-col'>
            <div className='flex items-center gap-1.5'>
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
                  'group-has flex min-h-7 items-center justify-center group-focus-within:opacity-100 group-hover:opacity-100 group-has-[button[aria-expanded="true"]]:opacity-100',
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

        <div className='ml-10 hidden flex-none items-center gap-1 lg:ml-0 lg:flex'>
          <div className='flex flex-1 flex-row-reverse items-center gap-1 sm:flex-row'>
            <ProjectSubscriptionButton project={project} />
            <ProjectMembershipButton project={project} joinLabel='Join' className='lg:w-18 w-full' />
          </div>
          <div className='flex lg:opacity-0 lg:group-hover:opacity-100 [&:has(button[aria-expanded="true"])]:opacity-100'>
            <ProjectOverflowMenu type='dropdown' project={project} />
          </div>
        </div>
      </li>
    </ProjectOverflowMenu>
  )
}
