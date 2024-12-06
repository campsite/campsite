import { Select } from '@campsite/ui'

import { deliveryDayOptions } from '@/utils/notificationDeliveryTimes'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function DayPicker(props: Props) {
  const { value, onChange } = props

  return (
    <Select
      options={deliveryDayOptions}
      value={deliveryDayOptions.find((o) => o.value === value)?.value || deliveryDayOptions[0].value}
      onChange={onChange}
    />
  )
}
