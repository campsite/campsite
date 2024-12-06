/* eslint-disable max-lines */
import { useState } from 'react'
import { useDebounce } from 'use-debounce'

import { Project } from '@campsite/types'
import { Command } from '@campsite/ui'
import { cn } from '@campsite/ui/utils'

import { CallsContent } from '@/components/Calls'
import { IndexPageContent, IndexSearchInput } from '@/components/IndexPages/components'
import { ProjectArchiveBanner } from '@/components/Projects/ProjectArchiveBanner'
import { ProjectPinnedFeed } from '@/components/Projects/ProjectPinnedFeed'
import { PROJECT_PAGE_SCROLL_CONTAINER_ID } from '@/components/Projects/utils'
import { SubjectCommand } from '@/components/Subject'
import { BreadcrumbTitlebarContainer } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useGetProjectCalls } from '@/hooks/useGetProjectCalls'
import { useGetProjectPins } from '@/hooks/useGetProjectPins'

interface ProjectCallsProps {
  project: Project
}

export function ProjectCalls({ project }: ProjectCallsProps) {
  const [query, setQuery] = useState('')
  const [queryDebounced] = useDebounce(query, 150)
  const getCalls = useGetProjectCalls({ projectId: project.id, query: queryDebounced })
  const getPins = useGetProjectPins({ id: project.id })
  const isLoadingPinsOrCalls = getCalls.isLoading || getPins.isLoading
  const isSearching = query.length > 0
  const isSearchLoading = queryDebounced.length > 0 && getCalls.isFetching

  return (
    <>
      <BreadcrumbTitlebarContainer className='h-auto min-h-10 py-1.5'>
        <IndexSearchInput query={query} setQuery={setQuery} isSearchLoading={isSearchLoading} />
        {project.archived && <ProjectArchiveBanner />}
      </BreadcrumbTitlebarContainer>

      <IndexPageContent id={PROJECT_PAGE_SCROLL_CONTAINER_ID} className='@container flex-1'>
        <SubjectCommand>
          <Command.List
            className={cn('flex flex-1 flex-col', { 'gap-4 md:gap-6 lg:gap-8': !isSearching, 'gap-px': isSearching })}
          >
            {!isSearching && !isLoadingPinsOrCalls && <ProjectPinnedFeed project={project} />}
            {!isLoadingPinsOrCalls && <CallsContent getCalls={getCalls} isSearching={isSearching} project={project} />}
          </Command.List>
        </SubjectCommand>
      </IndexPageContent>
    </>
  )
}
