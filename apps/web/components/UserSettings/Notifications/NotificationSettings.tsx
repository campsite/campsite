import * as SettingsSection from 'components/SettingsSection'
import toast from 'react-hot-toast'

import { ScheduledNotification } from '@campsite/types'
import { LazyLoadingSpinner, UIText } from '@campsite/ui'

import { TimezonePicker } from '@/components/ScheduledNotification/TimezonePicker'
import { MessageEmailSettings } from '@/components/UserSettings/Notifications/MessageEmailSettings'
import { useGetCurrentUserNotifications } from '@/hooks/useGetCurrentUserNotifications'
import { useUpdateScheduledNotification } from '@/hooks/useUpdateScheduledNotification'
import { NotificationName } from '@/utils/types'

import { DailySummarySettings } from './DailySummary'
import { EmailSettings } from './Email'
import { WeeklySummarySettings } from './WeeklySummary'

export function NotificationSettings() {
  const getNotifications = useGetCurrentUserNotifications()
  const updateNotification = useUpdateScheduledNotification()

  const notifications = getNotifications.data

  const tz =
    getNotifications.data?.find((n) => n.name === NotificationName.WeeklyDigest)?.time_zone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'America/Los_Angeles'

  /*
    If the user changes their global time zone preference, the value will flow
    through all of the other scheduled notifications that they have enabled.
  */
  function handleChange(value: string) {
    if (notifications && notifications.length > 0) {
      const notificationPromises = notifications.map(async (n: ScheduledNotification) => {
        return await updateNotification.mutate({
          ...n,
          time_zone: value
        })
      })

      Promise.all(notificationPromises).then(() => {
        toast('Time zone updated')
      })
    }
  }

  return (
    <SettingsSection.Section id='notifications'>
      <SettingsSection.Header>
        <SettingsSection.Title>Notification emails</SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Description>
        Choose how you want to stay up to date with new activity
      </SettingsSection.Description>

      <SettingsSection.Separator />

      {!getNotifications.data && getNotifications.isLoading && (
        <div className='flex items-center justify-center p-8'>
          <LazyLoadingSpinner />
        </div>
      )}

      {getNotifications.data && !getNotifications.isLoading && (
        <>
          <div className='divide-y'>
            <WeeklySummarySettings tz={tz} />
            <DailySummarySettings tz={tz} />
            <EmailSettings />
            <MessageEmailSettings />
          </div>
          {getNotifications.data.find((n) => n.name === NotificationName.WeeklyDigest) && (
            <SettingsSection.Footer>
              <div className='grid w-full grid-cols-1 pb-1 pt-1 md:grid-cols-2'>
                <UIText weight='font-medium' className='col-span-2 pb-2'>
                  Timezone
                </UIText>
                <div className='col-span-2 md:col-span-1'>
                  <TimezonePicker
                    // optimistically created notifications don't have an id, so the timezone can't be changed yet
                    disabled={notifications?.some((n) => !n.id)}
                    value={tz}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </SettingsSection.Footer>
          )}
        </>
      )}
    </SettingsSection.Section>
  )
}
