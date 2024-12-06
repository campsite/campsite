import { useState } from 'react'
import { useAtomValue } from 'jotai'
import { useDebounce } from 'use-debounce'

import { Project } from '@campsite/types/generated'
import { Command } from '@campsite/ui'
import { cn } from '@campsite/ui/utils'

import { IndexPageContent, IndexSearchInput } from '@/components/IndexPages/components'
import { NewNoteButton } from '@/components/NotesIndex/NewNoteButton'
import { NotesContent } from '@/components/NotesIndex/NotesContent'
import {
  filterAtom as noteFilterAtom,
  NotesIndexDisplayDropdown,
  sortAtom as noteSortAtom
} from '@/components/NotesIndex/NotesIndexDisplayDropdown'
import { ProjectArchiveBanner } from '@/components/Projects/ProjectArchiveBanner'
import { ProjectPinnedFeed } from '@/components/Projects/ProjectPinnedFeed'
import { PROJECT_PAGE_SCROLL_CONTAINER_ID } from '@/components/Projects/utils'
import { SubjectCommand } from '@/components/Subject'
import { BreadcrumbTitlebarContainer } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetProjectNotes } from '@/hooks/useGetProjectNotes'
import { useGetProjectPins } from '@/hooks/useGetProjectPins'

interface ProjectNotesProps {
  project: Project
}

export function ProjectNotes({ project }: ProjectNotesProps) {
  const [query, setQuery] = useState('')
  const { data: currentUser } = useGetCurrentUser()
  const { scope } = useScope()
  const filter = useAtomValue(noteFilterAtom(scope))
  const sort = useAtomValue(noteSortAtom({ scope, filter }))
  const [queryDebounced] = useDebounce(query, 150)
  const getNotes = useGetProjectNotes({
    projectId: project.id,
    query: queryDebounced,
    order: { by: sort, direction: 'desc' }
  })
  const getPins = useGetProjectPins({ id: project.id })
  const isLoadingPinsOrNotes = getNotes.isLoading || getPins.isLoading

  const isSearching = query.length > 0
  const isSearchLoading = queryDebounced.length > 0 && getNotes.isFetching

  const layout = currentUser?.preferences?.notes_layout
  const maxW = layout === 'list' ? 'max-w-4xl' : 'max-w-7xl 3xl:max-w-7xl'

  return (
    <>
      <BreadcrumbTitlebarContainer className='h-auto min-h-10 py-1.5'>
        <IndexSearchInput query={query} setQuery={setQuery} isSearchLoading={isSearchLoading} />
        <NotesIndexDisplayDropdown />
        <NewNoteButton size='sm' />
        {project.archived && <ProjectArchiveBanner />}
      </BreadcrumbTitlebarContainer>

      <IndexPageContent id={PROJECT_PAGE_SCROLL_CONTAINER_ID} className={cn('@container flex-1', maxW)}>
        <SubjectCommand>
          <Command.List
            className={cn('flex flex-1 flex-col', { 'gap-4 md:gap-6 lg:gap-8': !isSearching, 'gap-px': isSearching })}
          >
            {!isSearching && !isLoadingPinsOrNotes && <ProjectPinnedFeed project={project} />}
            {!isLoadingPinsOrNotes && <NotesContent getNotes={getNotes} searching={isSearching} hideProject />}
          </Command.List>
        </SubjectCommand>
      </IndexPageContent>
    </>
  )
}
