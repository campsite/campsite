import { PropsWithChildren } from 'react'

import { Note } from '@campsite/types'

import { useCreateNoteFollowUp } from '@/hooks/useCreateNoteFollowUp'
import { useDeleteNoteFollowUp } from '@/hooks/useDeleteNoteFollowUp'

import { FollowUpDropdown, FollowUpDropdownRef } from '../FollowUp'

export function NoteFollowUpDropdown({
  children,
  note,
  followUpRef,
  side = 'bottom',
  align = 'center'
}: PropsWithChildren & {
  note: Note
  followUpRef?: React.RefObject<FollowUpDropdownRef>
  side?: 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
}) {
  const createFollowUp = useCreateNoteFollowUp()
  const deleteFollowUp = useDeleteNoteFollowUp()

  return (
    <FollowUpDropdown
      ref={followUpRef}
      followUps={note.follow_ups}
      onCreate={({ show_at }) => createFollowUp.mutate({ noteId: note.id, show_at })}
      onDelete={({ id }) => deleteFollowUp.mutate({ noteId: note.id, id })}
      side={side}
      align={align}
    >
      {children}
    </FollowUpDropdown>
  )
}
