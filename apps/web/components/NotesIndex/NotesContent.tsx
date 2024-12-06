import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { Note, NotePage } from '@campsite/types/generated'
import { Command, useCommand } from '@campsite/ui/Command'
import { ConditionalWrap } from '@campsite/ui/utils'

import { EmptySearchResults } from '@/components/Feed/EmptySearchResults'
import { IndexPageLoading } from '@/components/IndexPages/components'
import { InfiniteLoader } from '@/components/InfiniteLoader'
import { NotesIndexEmptyState } from '@/components/NotesIndex'
import { NoteRow } from '@/components/NotesIndex/NoteRow'
import { NotesGrid } from '@/components/NotesIndex/NotesGrid'
import { NotesList } from '@/components/NotesIndex/NotesList'
import { SubjectCommand } from '@/components/Subject/SubjectCommand'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

interface Props {
  getNotes: ReturnType<typeof useInfiniteQuery<NotePage>>
  searching?: boolean
  hideProject?: boolean
}

export function NotesContent({ getNotes, searching, hideProject }: Props) {
  const { data: currentUser } = useGetCurrentUser()
  const notes = useMemo(() => flattenInfiniteData(getNotes.data) ?? [], [getNotes.data])

  if (getNotes.isLoading) {
    return <IndexPageLoading />
  }

  if (!notes.length) {
    return searching ? <EmptySearchResults /> : <NotesIndexEmptyState />
  }

  const layout = currentUser?.preferences?.notes_layout

  return (
    <>
      {searching ? (
        <NotesSearchList notes={notes} hideProject={hideProject} />
      ) : layout === 'list' ? (
        <NotesList notes={notes} hideProject={hideProject} />
      ) : (
        <NotesGrid notes={notes} hideProject={hideProject} />
      )}

      <InfiniteLoader
        hasNextPage={!!getNotes.hasNextPage}
        isError={!!getNotes.isError}
        isFetching={!!getNotes.isFetching}
        isFetchingNextPage={!!getNotes.isFetchingNextPage}
        fetchNextPage={getNotes.fetchNextPage}
      />
    </>
  )
}

function NotesSearchList({ notes, hideProject }: { notes: Note[]; hideProject?: boolean }) {
  const needsCommandWrap = !useCommand()

  return (
    <ConditionalWrap
      condition={needsCommandWrap}
      wrap={(children) => (
        <SubjectCommand>
          <Command.List className='-mx-2 flex flex-1 flex-col gap-px'>{children}</Command.List>
        </SubjectCommand>
      )}
    >
      {notes.map((note) => (
        <NoteRow note={note} key={note.id} display='search' hideProject={hideProject} />
      ))}
    </ConditionalWrap>
  )
}
