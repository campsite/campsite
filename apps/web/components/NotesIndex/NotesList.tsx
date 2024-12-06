import { useMemo } from 'react'
import { useAtomValue } from 'jotai'

import { Note } from '@campsite/types'
import { Command, ConditionalWrap, UIText, useCommand } from '@campsite/ui'

import { NoteRow } from '@/components/NotesIndex/NoteRow'
import { filterAtom, sortAtom } from '@/components/NotesIndex/NotesIndexDisplayDropdown'
import { SubjectCommand } from '@/components/Subject/SubjectCommand'
import { useScope } from '@/contexts/scope'
import { getGroupDateHeading } from '@/utils/getGroupDateHeading'
import { groupByDate } from '@/utils/groupByDate'

interface Props {
  notes: Note[]
  hideProject?: boolean
}

export function NotesList({ notes, hideProject }: Props) {
  const { scope } = useScope()
  const filter = useAtomValue(filterAtom(scope))
  const sort = useAtomValue(sortAtom({ scope, filter }))
  const groups = useMemo(() => groupByDate(notes, (note) => note[sort]), [notes, sort])
  const needsCommandWrap = !useCommand()

  return (
    <ConditionalWrap
      condition={needsCommandWrap}
      wrap={(children) => (
        <SubjectCommand>
          <Command.List className='flex flex-1 flex-col gap-4 md:gap-6 lg:gap-8'>{children}</Command.List>
        </SubjectCommand>
      )}
    >
      {Object.entries(groups).map(([date, notes]) => {
        const dateHeading = getGroupDateHeading(date)

        return (
          <div key={date} className='flex flex-col'>
            <div className='flex items-center gap-4 py-2'>
              <UIText weight='font-medium' tertiary>
                {dateHeading}
              </UIText>
              <div className='flex-1 border-b' />
            </div>

            <div className='-mx-2 flex flex-col gap-px py-2'>
              {notes.map((note) => (
                <NoteRow note={note} key={note.id} hideProject={hideProject} />
              ))}
            </div>
          </div>
        )
      })}
    </ConditionalWrap>
  )
}
