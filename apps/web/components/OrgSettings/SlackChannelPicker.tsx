import { useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'

import { SlackChannel } from '@campsite/types'
import { AlertIcon, HashtagIcon, LockIcon, Select, SelectOption, SelectTrigger, SlackIcon } from '@campsite/ui'

import { useCreateSlackChannelSync } from '@/hooks/useCreateSlackChannelSync'
import { useGetSlackChannel } from '@/hooks/useGetSlackChannel'
import { useGetSlackChannels } from '@/hooks/useGetSlackChannels'
import { useRemoteDataSelectFilter } from '@/hooks/useRemoteDataSelectFilter'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

interface Props {
  onChange: (channel?: SlackChannel) => void
  activeId?: string | null
  includeSlackIcon?: boolean
}

function SlackChannelPicker(props: Props) {
  const { onChange, activeId, includeSlackIcon } = props
  const [query, setQuery] = useState<string>()
  const [debouncedQuery] = useDebounce(query, 200)

  const { data: activeChannel } = useGetSlackChannel({ providerChannelId: activeId })
  const prependActiveChannel = (channels: SlackChannel[]) =>
    activeChannel ? [activeChannel, ...channels.filter((c) => c.id !== activeChannel.id)] : channels

  const getChannels = useGetSlackChannels({ query: debouncedQuery })
  const channels = useMemo(() => flattenInfiniteData(getChannels.data), [getChannels.data]) || []
  const remoteDataSelectFilter = useRemoteDataSelectFilter({ query: debouncedQuery, loading: getChannels.isLoading })

  const [syncInitiated, setSyncInitiated] = useState(false)
  const syncChannels = useCreateSlackChannelSync()
  const handleOpenChange = (open: boolean) => {
    if (!open || syncInitiated) return
    syncChannels.mutate()
    setSyncInitiated(true)
  }

  if (getChannels.error) {
    return (
      <div className='flex items-center justify-center space-x-2 p-1 text-sm'>
        <AlertIcon />
        <span>Unable to find your team’s Slack channels</span>
      </div>
    )
  }

  return (
    <ChannelPicker
      activeId={activeId}
      channels={prependActiveChannel(channels)}
      customFilter={remoteDataSelectFilter}
      onChange={onChange}
      onQueryChange={setQuery}
      onOpenChange={handleOpenChange}
      leftSlot={includeSlackIcon && <SlackIcon size={16} />}
      disabled={getChannels.isLoading}
    />
  )
}

export default SlackChannelPicker

interface ChannelPickerProps {
  activeId?: string | null
  channels: SlackChannel[]
  customFilter?: (option: SelectOption) => boolean
  onChange: (channel?: SlackChannel) => void
  onQueryChange?: (query: string) => void
  onOpenChange?: (open: boolean) => void
  leftSlot?: React.ReactNode
  disabled?: boolean
}

const NULL_CHANNEL = {
  value: 'none',
  label: 'Select a channel'
} as SelectOption

function ChannelPicker(props: ChannelPickerProps) {
  const { channels, customFilter, onChange, onQueryChange, onOpenChange, activeId, leftSlot } = props

  const options = useMemo(() => {
    let results = channels.map((channel) => ({
      value: channel.id,
      label: channel.name,
      leftSlot: channel.is_private ? <LockIcon /> : <HashtagIcon />
    })) as SelectOption[]

    results.unshift(NULL_CHANNEL)

    return results
  }, [channels])

  const activeChannel = useMemo(() => {
    const active = options.find((c) => c.value === activeId)

    return active || NULL_CHANNEL
  }, [options, activeId])

  async function handleOnChange(value: string) {
    const isNullChannel = value === NULL_CHANNEL.value
    const channel = isNullChannel ? undefined : channels.find((c) => c.id === value)

    await onChange(channel)
  }

  return (
    <Select
      typeAhead
      disabled={props.disabled}
      options={options}
      value={activeChannel.value}
      customFilter={customFilter}
      onChange={handleOnChange}
      onQueryChange={onQueryChange}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger leftSlot={leftSlot} />
    </Select>
  )
}
