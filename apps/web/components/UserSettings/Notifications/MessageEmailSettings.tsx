import toast from 'react-hot-toast'

import { Checkbox, UIText } from '@campsite/ui'

import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useUpdatePreference } from '@/hooks/useUpdatePreference'
import { apiErrorToast } from '@/utils/apiErrorToast'

export function MessageEmailSettings() {
  const currentUser = useGetCurrentUser()
  const updatePreference = useUpdatePreference()
  const emailEnabled = currentUser?.data?.preferences?.message_email_notifications !== 'disabled'

  function handleEnableDisable(checked: boolean) {
    updatePreference.mutate(
      {
        preference: 'message_email_notifications',
        value: checked ? 'enabled' : 'disabled'
      },
      {
        onSuccess: () => {
          toast(`Message email notifications ${checked ? 'enabled' : 'disabled'}`)
        },
        onError: apiErrorToast
      }
    )
  }

  return (
    <form className='flex flex-col p-3 pt-3'>
      <div className='flex flex-col gap-1'>
        <label className='flex items-center space-x-3 self-start'>
          <Checkbox disabled={updatePreference.isPending} checked={emailEnabled} onChange={handleEnableDisable} />
          <UIText weight='font-medium'>Message activity</UIText>
        </label>
      </div>
      <div className='ml-8'>
        <UIText tertiary>Get email notifications for direct messages and group messages that you missed.</UIText>
      </div>
    </form>
  )
}
