import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { Call } from '@campsite/types'
import { LockIcon, Select, SelectTrigger, SelectValue } from '@campsite/ui'

import { useDeleteCallProjectPermission } from '@/hooks/useDeleteCallProjectPermission'
import { useFilteredProjects } from '@/hooks/useFilteredProjects'
import { useUpdateCallProjectPermission } from '@/hooks/useUpdateCallProjectPermission'
import { projectToOption } from '@/utils/projectToOption'

import { ProjectAccessory } from '../Projects/ProjectAccessory'

interface CallProjectPickerProps {
  call: Call
}

export function CallProjectPicker({ call }: CallProjectPickerProps) {
  const { mutate: updateCallProjectPermission } = useUpdateCallProjectPermission()
  const { mutate: deleteCallProjectPermission } = useDeleteCallProjectPermission()
  const selectedProject = call.project
  const [query, setQuery] = useState<string>()
  const { filteredProjects, refetch } = useFilteredProjects({
    query,
    selectedProjectId: selectedProject?.id
  })
  const options = useMemo(() => {
    return [
      {
        leftSlot: <LockIcon />,
        value: 'none',
        label: 'Private'
      },
      ...filteredProjects.map(projectToOption)
    ]
  }, [filteredProjects])

  const value = selectedProject?.id ?? 'none'
  const leftSlot = selectedProject ? <ProjectAccessory project={selectedProject} /> : <LockIcon />

  return (
    <Select
      typeAhead
      showCheckmark
      align='center'
      value={value}
      onQueryChange={setQuery}
      options={options}
      onChange={(value) => {
        if (value === 'none') {
          deleteCallProjectPermission({ callId: call.id }, { onSuccess: () => toast('Changed to private call') })
        } else {
          updateCallProjectPermission(
            {
              callId: call.id,
              project_id: value,
              permission: call.project_permission === 'edit' ? 'edit' : 'view'
            },
            {
              onSuccess: () => {
                const movedToProject = filteredProjects?.find((p) => p.id === value)

                if (!movedToProject) return
                const movedToProjectName = movedToProject.accessory
                  ? `${movedToProject.accessory} ${movedToProject.name}`
                  : movedToProject.name

                toast(`Moved call to ${movedToProjectName}`)
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
