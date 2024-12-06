import { Select } from '@campsite/ui'

import { deliveryTimeOptions } from '@/utils/notificationDeliveryTimes'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function TimePicker(props: Props) {
  const { value, onChange } = props

  return (
    <Select
      options={deliveryTimeOptions}
      value={deliveryTimeOptions.find((o) => o.value === value)?.value || deliveryTimeOptions[0].value}
      onChange={(value) => onChange(`${value}`)}
    />
  )
}
