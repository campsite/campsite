import { useState } from 'react'
import pluralize from 'pluralize'
import { useFormContext } from 'react-hook-form'

import { Button, Select, SelectTrigger, SelectValue } from '@campsite/ui'

import { useFilteredProjects } from '@/hooks/useFilteredProjects'
import { projectToOption } from '@/utils/projectToOption'

import { PostSchema } from '../Post/schema'
import { useFormSetValue } from './hooks/useFormSetValue'

export function PostComposerProjectPicker() {
  const methods = useFormContext<PostSchema>()
  const setValue = useFormSetValue<PostSchema>()
  const isSubmitting = methods.formState.isSubmitting
  const projectId = methods.watch('project_id')
  const [query, setQuery] = useState<string>()
  const { filteredProjects, refetch } = useFilteredProjects({
    selectedProjectId: projectId,
    query,
    includeProjectId: projectId,
    excludeChatProjects: true
  })
  const selectedProject = filteredProjects.find((p) => p.id === projectId)

  const shortcut = 'mod+p'

  return (
    <div className='flex items-center gap-1.5'>
      <Select
        disabled={isSubmitting}
        align='start'
        showCheckmark
        value={projectId ?? ''}
        onQueryChange={setQuery}
        onChange={(value) => {
          setValue('project_id', value)
        }}
        options={filteredProjects.map(projectToOption)}
        onOpenChange={(open) => {
          if (open) {
            refetch()
          }
        }}
        shortcut={{
          keys: [shortcut],
          options: {
            // prevent opening the print dialog
            preventDefault: true,
            // enables activating the shortcut in the description editor
            enableOnContentEditable: true,
            // enables activating the shortcut in the title input
            enableOnFormTags: true
          }
        }}
        typeAhead
      >
        <SelectTrigger tooltip='Change channel' tooltipShortcut={shortcut} size='sm'>
          <SelectValue />
        </SelectTrigger>
      </Select>
      {selectedProject && selectedProject.guests_count > 0 && (
        <Button
          size='sm'
          variant='plain'
          className='cursor-default bg-amber-100 text-amber-900 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/20'
        >
          {selectedProject.guests_count} {pluralize('guest', selectedProject.guests_count)}
        </Button>
      )}
    </div>
  )
}
