import { useEffect, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { isMobile } from 'react-device-detect'
import { useDebounce } from 'use-debounce'

import { Project } from '@campsite/types'
import { Command } from '@campsite/ui'
import { cn } from '@campsite/ui/utils'

import { Feed } from '@/components/Feed'
import { NewPostButton } from '@/components/Home/NewPostButton'
import { IndexPageContent, IndexSearchInput } from '@/components/IndexPages/components'
import { setLastUsedPostFeedAtom } from '@/components/Post/PostNavigationButtons'
import { PostsIndexDisplayDropdown } from '@/components/PostsIndex/PostsIndexDisplayDropdown'
import { ProjectArchiveBanner } from '@/components/Projects/ProjectArchiveBanner'
import { ProjectPinnedFeed } from '@/components/Projects/ProjectPinnedFeed'
import { PROJECT_PAGE_SCROLL_CONTAINER_ID } from '@/components/Projects/utils'
import { useIsSplitViewAvailable } from '@/components/SplitView/hooks'
import { SubjectCommand } from '@/components/Subject'
import { BreadcrumbTitlebarContainer } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { useCreateProjectView } from '@/hooks/useCreateProjectView'
import { useCurrentUserOrOrganizationHasFeature } from '@/hooks/useCurrentUserOrOrganizationHasFeature'
import { filterAtom as postFilterAtom, sortAtom as postSortAtom } from '@/hooks/useGetPostsIndex'
import { useGetProjectPins } from '@/hooks/useGetProjectPins'
import { useGetProjectPosts } from '@/hooks/useGetProjectPosts'
import { usePostsDisplayPreference } from '@/hooks/usePostsDisplayPreference'

interface ProjectPostsProps {
  project: Project
}

export function ProjectPosts({ project }: ProjectPostsProps) {
  const { scope } = useScope()
  const filter = useAtomValue(postFilterAtom({ scope }))
  const sort = useAtomValue(postSortAtom({ scope, filter }))

  const [query, setQuery] = useState('')
  const [queryDebounced] = useDebounce(query, 150)

  const getPosts = useGetProjectPosts({
    projectId: project.id,
    query: queryDebounced,
    order: { by: sort, direction: 'desc' },
    hideResolved:
      (project.viewer_display_preferences && !project.viewer_display_preferences.display_resolved) ||
      !project.display_preferences.display_resolved
  })
  const { mutate: createProjectView } = useCreateProjectView()
  const setLastUsedFeed = useSetAtom(setLastUsedPostFeedAtom)
  const getPins = useGetProjectPins({ id: project.id })
  const isLoadingPinsOrPosts = getPosts.isLoading || getPins.isLoading

  const isSearching = query.length > 0
  const isSearchLoading = queryDebounced.length > 0 && getPosts.isFetching
  const displayPreference = usePostsDisplayPreference()

  const { isSplitViewAvailable } = useIsSplitViewAvailable()
  const hasComfyCompactLayout = useCurrentUserOrOrganizationHasFeature('comfy_compact_layout')

  useEffect(() => {
    setLastUsedFeed({ type: 'project', projectId: project.id })
  }, [project.id, setLastUsedFeed])

  useEffect(() => {
    createProjectView({ projectId: project.id })
  }, [createProjectView, project.id])

  const displayPreferences = project.viewer_display_preferences || project.display_preferences

  return (
    <>
      <BreadcrumbTitlebarContainer className='h-auto min-h-10 py-1.5'>
        <IndexSearchInput query={query} setQuery={setQuery} isSearchLoading={isSearchLoading} />
        <PostsIndexDisplayDropdown project={project} />
        {project.archived && <ProjectArchiveBanner />}
      </BreadcrumbTitlebarContainer>

      <IndexPageContent id={PROJECT_PAGE_SCROLL_CONTAINER_ID} className='@container flex-1'>
        <SubjectCommand>
          <Command.List
            className={cn('flex flex-1 flex-col', { 'gap-4 md:gap-6 lg:gap-8': !isSearching, 'gap-px': isSearching })}
          >
            <div
              className={cn('flex flex-col gap-4 md:gap-6 lg:gap-8', {
                'mx-auto w-full max-w-[--feed-width]':
                  !isSplitViewAvailable && !hasComfyCompactLayout && displayPreference === 'comfortable',
                'mb-8': isSearching
              })}
            >
              {!isMobile && <NewPostButton />}
              {!isSearching && !isLoadingPinsOrPosts && <ProjectPinnedFeed project={project} />}
            </div>
            {!isLoadingPinsOrPosts && (
              <Feed
                getPosts={getPosts}
                group={sort}
                searching={isSearching}
                hideProject
                isWriteableForViewer={false}
                hideReactions={!displayPreferences.display_reactions}
                hideAttachments={!displayPreferences.display_attachments}
                hideComments={!displayPreferences.display_comments}
              />
            )}
          </Command.List>
        </SubjectCommand>
      </IndexPageContent>
    </>
  )
}
