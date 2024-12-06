import { Select } from '@campsite/ui'

import { timezonePickerOptions } from '@/utils/timezones'

interface Props {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function TimezonePicker(props: Props) {
  const { value, onChange, disabled = false } = props

  return (
    <Select
      typeAhead
      options={timezonePickerOptions}
      value={
        timezonePickerOptions.find((o) => o.value === value)?.value ||
        (timezonePickerOptions.find((o) => o.value === 'America/Los_Angeles')?.value as string)
      }
      disabled={disabled}
      onChange={onChange}
    />
  )
}
