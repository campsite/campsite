import toast from 'react-hot-toast'

import { Note } from '@campsite/types'
import { Button, cn, UIText } from '@campsite/ui'

import { NoteProjectPicker } from '@/components/NoteSharePopover/NoteProjectPicker'
import { ProjectAccessory } from '@/components/Projects/ProjectAccessory'
import {
  projectPermissionActionToLabel,
  ProjectPermissionsSelect
} from '@/components/Projects/ProjectPermissionsSelect'
import { useUpdateNoteProjectPermission } from '@/hooks/useUpdateNoteProjectPermission'

export function NoteProjectPermissions({ note }: { note: Note }) {
  const { mutate: updateNoteProjectPermission } = useUpdateNoteProjectPermission()

  if (!note.viewer_can_edit && note.project && note.project_permission !== 'none') {
    return (
      <div className='grid grid-cols-5 items-center gap-2'>
        <div className='col-span-4 flex items-center gap-2'>
          <ProjectAccessory project={note.project} />
          <UIText size='text-sm' weight='font-medium' className='line-clamp-1'>
            Everyone in {note.project.name}
          </UIText>
        </div>
        <div className='col-span-1 flex justify-end'>
          <Button variant='plain' disabled>
            {projectPermissionActionToLabel(note.project_permission)}
          </Button>
        </div>
      </div>
    )
  }

  if (note.viewer_can_edit) {
    const noteProjectId = note.project?.id

    return (
      <div
        className={cn('flex items-center justify-between gap-2', {
          'grid-cols-1': note.project_permission === 'none',
          'grid-cols-5': note.project_permission !== 'none'
        })}
      >
        <div className='col-span-3 flex-1'>
          <NoteProjectPicker note={note} />
        </div>

        {noteProjectId && note.project_permission !== 'none' && (
          <div className='shrink-0'>
            <ProjectPermissionsSelect
              selected={note.project_permission}
              onChange={(value) =>
                updateNoteProjectPermission(
                  { noteId: note.id, project_id: noteProjectId, permission: value },
                  { onSuccess: () => toast('Permission updated') }
                )
              }
            />
          </div>
        )}
      </div>
    )
  }

  return null
}
