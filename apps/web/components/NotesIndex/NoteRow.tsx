import { memo } from 'react'
import { format } from 'date-fns'

import { Note } from '@campsite/types'
import { GlobeIcon, HighlightedCommandItem, NoteFilledIcon, Tooltip, UIText } from '@campsite/ui'

import { NoteOverflowMenu } from '@/components/NoteOverflowMenu'
import { useHandleCommandListSubjectSelect } from '@/components/Projects/hooks/useHandleHighlightedItemSelect'
import { ProjectTag } from '@/components/ProjectTag'
import { ViewerFollowUpTag } from '@/components/ViewerFollowUpTag'
import { useScope } from '@/contexts/scope'
import { encodeCommandListSubject } from '@/utils/commandListSubject'

import { NotePrivacyIndicator } from '.'

interface NoteRowProps {
  note: Note
  display?: 'default' | 'pinned' | 'search'
  hideProject?: boolean
}

export const NoteRow = memo(({ note, display = 'default', hideProject = false }: NoteRowProps) => {
  const { scope } = useScope()
  const { handleSelect } = useHandleCommandListSubjectSelect()

  const href = `/${scope}/notes/${note.id}`

  if (display === 'pinned') {
    return (
      <div className='relative flex items-center gap-3 px-3 py-2.5'>
        <NoteOverflowMenu type='context' note={note}>
          <HighlightedCommandItem
            className='absolute inset-0 z-0'
            value={encodeCommandListSubject(note, { href, pinned: true })}
            onSelect={handleSelect}
          />
        </NoteOverflowMenu>

        <div className='flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-900/50'>
          <NoteFilledIcon size={24} />
        </div>

        <UIText weight='font-medium' className='break-anywhere line-clamp-1 max-w-lg'>
          {note.title || 'Untitled'}
        </UIText>
      </div>
    )
  }

  return (
    <div className='relative flex items-center gap-3 px-3 py-2.5'>
      <NoteOverflowMenu type='context' note={note}>
        <HighlightedCommandItem
          className='absolute inset-0 z-0'
          value={encodeCommandListSubject(note, { href })}
          onSelect={handleSelect}
        />
      </NoteOverflowMenu>

      <div className='flex flex-1 items-center gap-3'>
        <NotePrivacyIndicator note={note} />

        <ViewerFollowUpTag followUps={note.follow_ups} />

        <UIText weight='font-medium' className='break-anywhere line-clamp-1 max-w-lg'>
          {note.title || 'Untitled'}
        </UIText>

        {display === 'search' && (
          <UIText quaternary className='break-anywhere line-clamp-1 flex-1'>
            {format(note.created_at, 'MMM d, yyyy')}
          </UIText>
        )}
      </div>

      <div className='flex items-center gap-1'>
        {note.public_visibility && (
          <Tooltip label='Published to the web'>
            <span className='relative text-blue-500'>
              <GlobeIcon size={18} strokeWidth='2' />
            </span>
          </Tooltip>
        )}
        {note.project && !hideProject && <ProjectTag project={note.project} />}
      </div>
    </div>
  )
})
NoteRow.displayName = 'NoteRow'
