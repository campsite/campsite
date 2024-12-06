import { Select, SelectTrigger } from '@campsite/ui'
import { AtSignIcon, BellIcon, BellOffIcon } from '@campsite/ui/Icons'

import { useGetThreadMembership } from '@/hooks/useGetThreadMembership'
import { useUpdateThreadMembership } from '@/hooks/useUpdateThreadMembership'

export function ThreadNotificationsSettingsSelect({ threadId }: { threadId: string }) {
  const { data: membership } = useGetThreadMembership({ threadId })
  const { mutate: updateMembership } = useUpdateThreadMembership({ threadId })

  function handleChange(newValue: string) {
    if (newValue === 'all' || newValue === 'mentions' || newValue === 'none') {
      updateMembership({ notification_level: newValue })
    }
  }

  if (!membership) {
    return <SelectTrigger className='py-1' />
  }

  return (
    <Select
      value={membership.notification_level}
      options={[
        {
          label: 'All new messages',
          sublabel: 'Notify me about every new message — I don’t want to miss anything.',
          leftSlot: <BellIcon />,
          value: 'all'
        },
        {
          label: 'Mentions and replies',
          sublabel: 'Notify me when I am mentioned or receive a reply.',
          leftSlot: <AtSignIcon />,
          value: 'mentions'
        },
        {
          label: 'Off',
          sublabel: 'Do not notify me.',
          leftSlot: <BellOffIcon />,
          value: 'none'
        }
      ]}
      onChange={handleChange}
    />
  )
}
