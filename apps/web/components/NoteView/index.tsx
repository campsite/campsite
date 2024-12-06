import { createContext, useContext, useEffect, useRef } from 'react'
import Router from 'next/router'

import { Note } from '@campsite/types'
import {
  ArrowUpRightIcon,
  Button,
  ChatBubbleIcon,
  ChevronDownIcon,
  GlobeIcon,
  Link,
  LockIcon,
  NoteIcon,
  PaperAirplaneIcon,
  PrivateNoteIcon,
  UIText
} from '@campsite/ui'

import { CopyCurrentUrl } from '@/components/CopyCurrentUrl'
import { EmptyState } from '@/components/EmptyState'
import { FullPageLoading } from '@/components/FullPageLoading'
import { InboxSplitViewTitleBar } from '@/components/InboxItems/InboxSplitView'
import { InboxTriageActions } from '@/components/InboxItems/InboxTriageActions'
import { NoteFavoriteButton } from '@/components/NotesIndex/NoteFavoriteButton'
import { SplitViewBreadcrumbs } from '@/components/SplitView'
import { useIsSplitViewAvailable } from '@/components/SplitView/hooks'
import { SubjectEspcapeLayeredHotkeys } from '@/components/Subject'
import { ProjectAccessoryBreadcrumbIcon } from '@/components/Titlebar/BreadcrumbPageIcons'
import { BreadcrumbLabel } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { useCreateNoteView } from '@/hooks/useCreateNoteView'
import { useGetNote } from '@/hooks/useGetNote'
import { useGetNoteComments } from '@/hooks/useGetNoteComments'
import { useGetNoteTimelineEvents } from '@/hooks/useGetNoteTimelineEvents'
import { useLiveNoteUpdates } from '@/hooks/useLiveNoteUpdates'

import { NoteCommentsPopover } from '../NoteComments/NoteCommentsPopover'
import { NoteEditor } from '../NoteEditor'
import { NoteOverflowMenu } from '../NoteOverflowMenu'
import { NoteSharePopover } from '../NoteSharePopover'
import { ScrollableContainer } from '../ScrollableContainer'
import { useTrackRecentlyViewedItem } from '../Sidebar/RecentlyViewed/utils'
import { NoteViewersPopover } from './NoteViewersPopover'

const NoteViewContext = createContext<string | null>(null)

export const useNoteView = () => useContext(NoteViewContext)

export function NoteView({ noteId }: { noteId: string }) {
  const { scope } = useScope()
  const { data: note, isLoading } = useGetNote({ id: noteId, enabled: !!noteId })

  if (isLoading) {
    return <FullPageLoading />
  }

  if (!note) {
    return (
      <EmptyState
        title='Note not found'
        message='It may have been deleted or had its permissions changed.'
        icon={<NoteIcon size={40} />}
      >
        <div className='mt-4'>
          <Button onClick={() => Router.push(`/${scope}`)} variant='primary'>
            Go home
          </Button>
        </div>
      </EmptyState>
    )
  }

  return (
    <NoteViewContext.Provider value={note.id}>
      <InnerNoteView note={note} />
    </NoteViewContext.Provider>
  )
}

function InnerNoteView({ note }: { note: Note }) {
  const { isSplitViewAvailable } = useIsSplitViewAvailable()

  const trackRef = useTrackRecentlyViewedItem({ id: note.id, note })

  useCreateLingerNoteView(note.id, !!note)
  useLiveNoteUpdates(note)

  // prefetch comments
  useGetNoteComments({ noteId: note.id })
  useGetNoteTimelineEvents({ noteId: note.id, enabled: true })

  return (
    <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
      <SubjectEspcapeLayeredHotkeys />
      <CopyCurrentUrl override={note.url} />

      <InboxSplitViewTitleBar hideSidebarToggle={isSplitViewAvailable}>
        {isSplitViewAvailable ? (
          <SplitViewBreadcrumbs />
        ) : (
          <>
            <InboxTriageActions />
            <NoteBreadcrumbs note={note} />
          </>
        )}

        <NoteTrailingAccessory noteId={note.id} />
      </InboxSplitViewTitleBar>

      <PublicVisibilityBanner note={note} />

      <ScrollableContainer id='note-scroll-container'>
        <div
          ref={trackRef}
          className='relative flex w-full flex-1 scroll-mt-4 px-4 pt-5 md:pt-10 lg:pt-12 xl:pt-16 2xl:pt-20'
        >
          {note && (
            <NoteEditor
              // key by note.id in order to reset tiptap editor state
              key={note.id}
              note={note}
            />
          )}
        </div>
      </ScrollableContainer>
    </div>
  )
}

function PublicVisibilityBanner({ note }: { note: Note }) {
  if (!note.public_visibility) return null
  return (
    <Link
      target='_blank'
      href={note.public_share_url}
      className='flex w-full items-center justify-center gap-4 border-b border-blue-100/60 bg-blue-50 px-4 py-2 text-sm text-blue-500 hover:bg-blue-100/70 dark:border-blue-900/35 dark:bg-blue-900/20 dark:text-blue-200 dark:hover:bg-blue-900/40'
    >
      <div className='flex items-center gap-2'>
        <GlobeIcon className='hidden flex-none sm:flex' />
        <UIText weight='font-medium' inherit>
          Published to the web
        </UIText>
        <ArrowUpRightIcon size={16} strokeWidth='2' />
      </div>
    </Link>
  )
}

function useCreateLingerNoteView(noteId: string, isLoaded: boolean) {
  const { mutate: create } = useCreateNoteView()
  const hasMarkedSeen = useRef(false)

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined

    if (isLoaded) {
      timer = setTimeout(() => {
        if (hasMarkedSeen.current) return
        hasMarkedSeen.current = true
        create({ noteId })
      }, 1000)
    }

    return () => clearTimeout(timer)
  }, [create, isLoaded, noteId])
}

function NoteBreadcrumbs({ note }: { note: Note }) {
  const { scope } = useScope()

  return (
    <div className='flex min-w-0 flex-1 items-center gap-1.5'>
      {note.project && note.project_permission !== 'none' ? (
        <>
          <Link
            className='break-anywhere flex min-w-0 items-center gap-1 truncate'
            href={`/${scope}/projects/${note.project.id}`}
          >
            <ProjectAccessoryBreadcrumbIcon project={note.project} />
            <BreadcrumbLabel>{note.project.name}</BreadcrumbLabel>
            {note.project.private && <LockIcon size={16} className='text-tertiary' />}
          </Link>

          <span className='-ml-1 -mr-0.5 inline-flex min-w-1 items-center'>
            {note.viewer_can_edit && (
              <NoteSharePopover note={note} align='start'>
                <Button size='sm' variant='plain' iconOnly accessibilityLabel='Move to channel' className='w-5'>
                  <ChevronDownIcon strokeWidth='2' size={16} />
                </Button>
              </NoteSharePopover>
            )}
          </span>
        </>
      ) : (
        <NoteSharePopover note={note} align='start'>
          <Button size='sm' variant='plain' leftSlot={<PrivateNoteIcon />} className='-mr-1'>
            <BreadcrumbLabel>Private</BreadcrumbLabel>
          </Button>
        </NoteSharePopover>
      )}

      <UIText quaternary>/</UIText>
      <Link href={`/${scope}/notes/${note.id}`} title={note.title} className='break-anywhere min-w-0 truncate'>
        <BreadcrumbLabel className='ml-1'>{note.title || 'Untitled'}</BreadcrumbLabel>
      </Link>
      <NoteFavoriteButton note={note} shortcutEnabled />
    </div>
  )
}

export function NoteTrailingAccessory({ noteId }: { noteId: string }) {
  const { data: note } = useGetNote({ id: noteId })
  const activeCommentsCount = note?.comments_count ?? 0

  return (
    <div className='flex items-center justify-end gap-0.5'>
      {note && <NoteViewersPopover note={note} />}

      {note && (
        <>
          <NoteSharePopover note={note}>
            <Button leftSlot={<PaperAirplaneIcon />} variant='plain' tooltip='Share note'>
              Share
            </Button>
          </NoteSharePopover>

          <NoteCommentsPopover note={note}>
            {activeCommentsCount > 0 ? (
              <Button leftSlot={<ChatBubbleIcon />} variant='plain'>
                {activeCommentsCount}
              </Button>
            ) : (
              <Button iconOnly={<ChatBubbleIcon />} accessibilityLabel='Comments' variant='plain' />
            )}
          </NoteCommentsPopover>

          <NoteOverflowMenu type='dropdown' note={note} enabledShortcuts={['delete']} />
        </>
      )}
    </div>
  )
}
