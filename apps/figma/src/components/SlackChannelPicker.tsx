import { useEffect, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { api } from 'src/api'
import { FormSchema } from 'src/core/schema'
import { useDebounce } from 'use-debounce'

import { SlackChannel } from '@campsite/types/generated'
import { Button, HashtagIcon, SlackIcon, UIText } from '@campsite/ui'

import { Select } from './Select'

export interface SlackChannelPickerProps {
  channel: SlackChannel | null
  onChannelChange(channel: SlackChannel): void
}

export function SlackChannelPicker({ channel, onChannelChange }: SlackChannelPickerProps) {
  const { control } = useFormContext<FormSchema>()
  const organization = useWatch({ control, name: 'organization' })
  const project = useWatch({ control, name: 'project' })

  const { data: currentProject, isSuccess } = api.projects.useGetQuery(organization, project ?? undefined)

  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 200)
  const { data: channels, isLoading } = api.slack.useSearchQuery({
    organization,
    query: debouncedQuery
  })

  useEffect(() => {
    if (isSuccess && !channel) {
      const nextChannel = currentProject?.slack_channel ?? channels?.[0]

      if (nextChannel) onChannelChange(nextChannel)
    }
  }, [channel, channels, onChannelChange, currentProject?.slack_channel, isSuccess])

  return (
    <Select
      container={document.getElementById('create-figma-plugin')}
      trigger={(children) => (
        <Button className='px-3' fullWidth align='left' size='large'>
          {children}
        </Button>
      )}
      fullWidth
      align='center'
      side='top'
      variant='combobox'
      query={query}
      onQueryChange={setQuery}
      value={channel}
      isLoading={query !== debouncedQuery || isLoading}
      options={channels ?? []}
      onValueChange={(channel) => {
        if (!channel) return

        onChannelChange(channel)
      }}
      getItemKey={(item) => item.id}
      renderItem={(item, location) => (
        <span className='flex items-center gap-2 overflow-hidden'>
          {location === 'value' ? <SlackIcon size={16} /> : <HashtagIcon size={16} />}
          <UIText className='truncate' element='span' weight='font-medium'>
            {item.name}
          </UIText>
        </span>
      )}
    />
  )
}
