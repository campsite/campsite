import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { Note } from '@campsite/types'
import { PrivateNoteIcon, Select, SelectTrigger, SelectValue } from '@campsite/ui'

import { useDeleteNoteProjectPermission } from '@/hooks/useDeleteNoteProjectPermission'
import { useFilteredProjects } from '@/hooks/useFilteredProjects'
import { useUpdateNoteProjectPermission } from '@/hooks/useUpdateNoteProjectPermission'
import { projectToOption } from '@/utils/projectToOption'

import { ProjectAccessory } from '../Projects/ProjectAccessory'

interface ProjectPickerProps {
  note: Note
  disabled?: boolean
}

export function NoteProjectPicker({ note, disabled }: ProjectPickerProps) {
  const { mutate: updateNoteProjectPermission } = useUpdateNoteProjectPermission()
  const { mutate: deleteNoteProjectPermission } = useDeleteNoteProjectPermission()
  const [query, setQuery] = useState<string>()
  const { filteredProjects, refetch } = useFilteredProjects({
    selectedProjectId: note.project?.id,
    query,
    excludeChatProjects: true
  })

  const options = useMemo(() => {
    return [
      {
        leftSlot: <PrivateNoteIcon />,
        value: 'none',
        label: 'Private'
      },
      ...filteredProjects.map(projectToOption)
    ]
  }, [filteredProjects])

  const value = note.project?.id ?? 'none'
  const leftSlot = note.project ? <ProjectAccessory project={note.project} /> : <PrivateNoteIcon />

  return (
    <Select
      typeAhead
      showCheckmark
      align='center'
      value={value}
      disabled={disabled}
      onQueryChange={setQuery}
      options={options}
      onChange={(value) => {
        if (value === 'none') {
          deleteNoteProjectPermission({ noteId: note.id }, { onSuccess: () => toast('Changed to private doc') })
        } else {
          updateNoteProjectPermission(
            {
              noteId: note.id,
              project_id: value,
              permission: note.project_permission === 'edit' ? 'edit' : 'view'
            },
            {
              onSuccess: () => {
                const movedToProject = filteredProjects?.find((p) => p.id === value)

                if (!movedToProject) return
                const movedToProjectName = movedToProject.accessory
                  ? `${movedToProject.accessory} ${movedToProject.name}`
                  : movedToProject.name

                toast(`Moved doc to ${movedToProjectName}`)
              }
            }
          )
        }
      }}
      onOpenChange={(open) => {
        if (open) {
          refetch()
        }
      }}
    >
      <SelectTrigger leftSlot={leftSlot} variant='base'>
        <SelectValue />
      </SelectTrigger>
    </Select>
  )
}
