import { useEffect, useMemo, useState } from 'react'
import { m } from 'framer-motion'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { api } from 'src/api'
import { useCommand } from 'src/core/command-context'
import { LAYOUT_TRANSITION } from 'src/core/motion'
import { FormSchema } from 'src/core/schema'
import { useDebounce } from 'use-debounce'

import { Button, ProjectIcon, UIText } from '@campsite/ui'

import { Select } from './Select'

export function ProjectPicker() {
  const command = useCommand()

  const { control, setValue } = useFormContext<FormSchema>()
  const organization = useWatch({ control, name: 'organization' })
  const project = useWatch({ control, name: 'project' })

  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 200)
  const { data: currentProject } = api.projects.useGetQuery(organization, project ?? undefined)

  const { data: projectPages, isLoading } = api.projects.useSearchQuery({
    organization,
    query: debouncedQuery
  })
  const projects = useMemo(() => projectPages?.pages.flatMap((page) => page.data) ?? [], [projectPages])

  useEffect(() => {
    if (projects?.length && !project) {
      setValue('project', projects[0].id, { shouldValidate: true })
    }
  }, [project, projects, setValue, command])

  return (
    <m.div layout='position' transition={LAYOUT_TRANSITION} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Controller
        control={control}
        name='project'
        render={({ field }) => (
          <Select
            container={document.getElementById('create-figma-plugin')}
            trigger={(children) => (
              <Button type='button' className='px-3' fullWidth align='left' size='large'>
                {children}
              </Button>
            )}
            fullWidth
            align='center'
            side='top'
            variant='combobox'
            query={query}
            onQueryChange={setQuery}
            value={currentProject}
            isLoading={query !== debouncedQuery || isLoading}
            options={projects}
            onValueChange={(project) => {
              if (!project) return

              field.onChange(project.id)
            }}
            getItemKey={(item) => item.id}
            renderItem={(item) => (
              <span className='flex gap-2 overflow-hidden'>
                {item.accessory ? <span className='h-5 w-5 text-center'>{item.accessory}</span> : <ProjectIcon />}
                <UIText className='truncate' element='span' weight='font-medium'>
                  {item.name}
                </UIText>
              </span>
            )}
          />
        )}
      />
    </m.div>
  )
}
