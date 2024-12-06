import { useEffect } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { api } from 'src/api'
import { useGetQuery } from 'src/api/services/organizations'
import { DEFAULT_VALUES, FormSchema } from 'src/core/schema'

import { Avatar } from '@campsite/ui/src/Avatar'
import { Button } from '@campsite/ui/src/Button'
import { DotsHorizontal } from '@campsite/ui/src/Icons'
import { UIText } from '@campsite/ui/src/Text'

import { Select } from './Select'

export function OrganizationSwitcher() {
  const { control, setValue, trigger } = useFormContext<FormSchema>()
  const organization = useWatch({ control, name: 'organization' })

  const { mutate: signOut } = api.auth.useSignOutMutation()

  const { data: organizations } = api.organizations.useGetAllQuery()
  const currentOrganization = organizations?.find((org) => organization === org.slug)

  const menuItems = [
    {
      label: 'Open Campsite',
      onSelect: () => void window.open(`${window.APP_URL}/${organization}`, '_blank')
    },
    {
      label: 'Sign out',
      onSelect: () => signOut()
    }
  ]

  // Prefetch the current query
  useGetQuery(organization)

  useEffect(() => {
    if (organizations?.length && !organization) {
      setValue('organization', organizations[0].slug, { shouldValidate: true })
    }
  }, [organization, organizations, setValue])

  return (
    <header className='border-b p-4'>
      <div className='-m-2 flex items-center justify-between'>
        <Controller
          control={control}
          name='organization'
          render={({ field }) => (
            <Select
              align='start'
              container={document.getElementById('create-figma-plugin')}
              disabled={!organizations?.length}
              options={organizations ?? []}
              value={currentOrganization}
              onValueChange={(org) => {
                if (org) {
                  field.onChange(org.slug)
                  setValue('project', DEFAULT_VALUES.project, { shouldValidate: true })
                  setValue('post', DEFAULT_VALUES.post, { shouldValidate: true })
                  requestAnimationFrame(() => trigger())
                }
              }}
              getItemKey={(org) => org.slug}
              getItemTextValue={(org) => org.name}
              renderItem={(org) => (
                <span className='flex items-center gap-2'>
                  <Avatar size='xs' name={org.name} urls={org.avatar_urls} />
                  <UIText element='span' weight='font-medium'>
                    {org.name}
                  </UIText>
                </span>
              )}
            />
          )}
        />

        <Select
          align='end'
          trigger={() => <Button variant='plain' iconOnly={<DotsHorizontal />} accessibilityLabel='Actions' />}
          options={menuItems}
          value={{
            label: 'placeholder',
            onSelect: () => {}
          }}
          onValueChange={(item) => item.onSelect()}
          getItemKey={(item) => item.label}
          getItemTextValue={(item) => item.label}
          renderItem={(item) => <UIText element='span'>{item.label}</UIText>}
        />
      </div>
    </header>
  )
}
