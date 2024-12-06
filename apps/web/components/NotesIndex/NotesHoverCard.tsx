import { useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'

import { Note } from '@campsite/types'
import { Button, Command, LoadingSpinner, NoteIcon, UIText } from '@campsite/ui'
import { HoverCard } from '@campsite/ui/src/HoverCard'
import { cn } from '@campsite/ui/src/utils'

import { EmptyState } from '@/components/EmptyState'
import { sidebarCollapsedAtom } from '@/components/Layout/AppLayout'
import { NoteRow } from '@/components/NotesIndex/NoteRow'
import { NoteIndexFilterType } from '@/components/NotesIndex/NotesIndexDisplayDropdown'
import { useGetNotesIndex } from '@/components/NotesIndex/useGetNotesIndex'
import { useScope } from '@/contexts/scope'
import { useCreateNote } from '@/hooks/useCreateNote'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useScopedStorage } from '@/hooks/useScopedStorage'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'
import { getGroupDateHeading } from '@/utils/getGroupDateHeading'
import { groupByDate } from '@/utils/groupByDate'

import { ViewerRoleCreateNoteUpsell } from './ViewerRoleCreateNoteUpsell'

export function NotesHoverList({
  children,
  side = 'right',
  align = 'start',
  sideOffset = 0,
  alignOffset = 0,
  disabled: _disabled = false
}: {
  children: React.ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  align?: 'start' | 'end' | 'center'
  sideOffset?: number
  alignOffset?: number
  disabled?: boolean
}) {
  const { scope } = useScope()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useScopedStorage<NoteIndexFilterType>('notes-index-filter', 'for-me')
  const getNotes = useGetNotesIndex({ enabled: open })
  const notes = useMemo(
    () => groupByDate(flattenInfiniteData(getNotes.data) || [], (note) => note.created_at),
    [getNotes.data]
  )
  const hasNotes = !!Object.keys(notes).length
  const isViewingNotes = router.pathname === '/[org]/notes'
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)
  const disabled = _disabled || sidebarCollapsed || isViewingNotes
  const href = `/${scope}/notes`

  return (
    <HoverCard open={open} onOpenChange={setOpen} disabled={disabled} targetHref={href}>
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>

      <HoverCard.Content side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset}>
        <HoverCard.Content.TitleBar>
          <Button onClick={() => setFilter('for-me')} variant={filter === 'for-me' ? 'flat' : 'plain'}>
            For me
          </Button>
          <Button onClick={() => setFilter('created')} variant={filter === 'created' ? 'flat' : 'plain'}>
            Created
          </Button>
          <Button className='mr-auto' onClick={() => setFilter('all')} variant={filter === 'all' ? 'flat' : 'plain'}>
            All
          </Button>
          <NewNoteButton
            onSuccess={({ id }) => {
              setOpen(false)
              router.push(`/${scope}/notes/${id}`)
            }}
          />
        </HoverCard.Content.TitleBar>

        {hasNotes && <NotesList notes={notes} />}

        {!hasNotes && !getNotes.isLoading && (
          <div className='flex flex-1 items-center justify-center px-6 py-12'>
            <EmptyState title='No notes yet' icon={<NoteIcon className='text-quaternary' size={32} />} />
          </div>
        )}

        {!hasNotes && getNotes.isLoading && (
          <div className='flex flex-1 items-center justify-center px-6 py-12'>
            <LoadingSpinner />
          </div>
        )}
      </HoverCard.Content>
    </HoverCard>
  )
}

function NewNoteButton({ onSuccess }: { onSuccess?: ({ id }: { id: string }) => void }) {
  const { data: currentOrganization } = useGetCurrentOrganization()
  // provide a callback to the hook as the hover list may unmount before the mutation finishes
  // and we always want to redirect on create
  const { mutate: createNote, isPending } = useCreateNote({ afterCreate: onSuccess })
  const [showViewerUpsellDialog, setShowViewerUpsellDialog] = useState(false)

  return (
    <>
      <Button
        className='ml-4'
        variant='primary'
        onClick={() => {
          if (!currentOrganization?.viewer_can_create_note) {
            setShowViewerUpsellDialog(true)
          } else {
            createNote()
          }
        }}
        disabled={isPending}
      >
        New
      </Button>
      <ViewerRoleCreateNoteUpsell open={showViewerUpsellDialog} onOpenChange={setShowViewerUpsellDialog} />
    </>
  )
}

function NotesList({ notes }: { notes: Record<string, Note[]> }) {
  return (
    <Command
      className='scrollbar-hide flex max-h-[420px] flex-col gap-px overflow-y-auto overscroll-contain outline-none'
      disableAutoSelect
      focusSelection
    >
      <Command.List>
        {Object.entries(notes).map(([date, notes], i) => {
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
                {notes.map((note) => (
                  <NoteRow note={note} key={note.id} />
                ))}
              </div>
            </div>
          )
        })}
      </Command.List>
    </Command>
  )
}
