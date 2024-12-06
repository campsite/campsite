import * as SettingsSection from 'components/SettingsSection'

import { Checkbox, UIText } from '@campsite/ui'

import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useUpdatePreference } from '@/hooks/useUpdatePreference'
import { apiErrorToast } from '@/utils/apiErrorToast'

export function Behaviors() {
  const { data: currentUser } = useGetCurrentUser()
  const updatePreference = useUpdatePreference()
  const isEnabled = currentUser?.preferences?.prefers_desktop_app === 'enabled'

  function handleChange() {
    updatePreference.mutate(
      {
        preference: 'prefers_desktop_app',
        value: currentUser?.preferences?.prefers_desktop_app === 'enabled' ? 'disabled' : 'enabled'
      },
      {
        onError: apiErrorToast
      }
    )
  }

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>Behaviors</SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Separator />

      <div className='flex items-center gap-3 px-3 pb-3'>
        <form>
          <label className='flex items-start gap-3'>
            <Checkbox checked={isEnabled} onChange={handleChange} disabled={updatePreference.isPending} />
            <div className='flex flex-col gap-1'>
              <UIText weight='font-medium'>Open links in Desktop App</UIText>
              <UIText tertiary>Open links to Campsite in the Desktop App by default</UIText>
            </div>
          </label>
        </form>
      </div>
    </SettingsSection.Section>
  )
}
