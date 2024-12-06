import * as SettingsSection from 'components/SettingsSection'

import { TimezonePicker } from '@/components/ScheduledNotification/TimezonePicker'
import { useCreateUserTimezone } from '@/hooks/useCreateUserTimezone'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { apiErrorToast } from '@/utils/apiErrorToast'

export function Timezone() {
  const { data: currentUser } = useGetCurrentUser()
  const createTimezone = useCreateUserTimezone()

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>Preferred timezone</SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Description>
        Your timezone determines when you receive certain notifications. Your team can see this timezone.
      </SettingsSection.Description>

      <SettingsSection.Separator />

      <div className='flex flex-col px-3 pb-3'>
        <TimezonePicker
          value={currentUser?.timezone ?? ''}
          onChange={(value) => createTimezone.mutate({ timezone: value }, { onError: apiErrorToast })}
        />
      </div>
    </SettingsSection.Section>
  )
}
