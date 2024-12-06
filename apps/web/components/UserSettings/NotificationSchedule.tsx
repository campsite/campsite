import { useEffect } from 'react'
import * as SettingsSection from 'components/SettingsSection'
import { FormProvider } from 'react-hook-form'
import { useDebouncedCallback } from 'use-debounce'

import { NotificationSchedule as NotificationScheduleType } from '@campsite/types/generated'
import { RadioGroupItem } from '@campsite/ui/Radio'
import { LoadingSpinner } from '@campsite/ui/Spinner'
import { UIText } from '@campsite/ui/Text'

import { NotificationScheduleDayButtons } from '@/components/NotificationSchedule/NotificationScheduleDayButtons'
import { NotificationScheduleRadioGroup } from '@/components/NotificationSchedule/NotificationScheduleRadioGroup'
import { NotificationScheduleTimeSelects } from '@/components/NotificationSchedule/NotificationScheduleTimeSelects'
import { useGetNotificationSchedule } from '@/hooks/useGetNotificationSchedule'
import { useNotificationScheduleForm, useOnSubmitNotificationScheduleForm } from '@/hooks/useNotificationScheduleForm'

export function NotificationSchedule() {
  const { data: notificationSchedule, isLoading } = useGetNotificationSchedule()

  return (
    <SettingsSection.Section id='notification-schedule'>
      <SettingsSection.Header>
        <SettingsSection.Title>Notification schedule</SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Description>
        We’ll only send you notifications during the windows you select. Anything you miss will be in your inbox to
        review later.
      </SettingsSection.Description>

      <SettingsSection.Separator />

      {isLoading || !notificationSchedule ? (
        <div className='mx-auto my-8'>
          <LoadingSpinner />
        </div>
      ) : (
        <NotificationScheduleForm notificationSchedule={notificationSchedule} />
      )}
    </SettingsSection.Section>
  )
}

function NotificationScheduleForm({ notificationSchedule }: { notificationSchedule: NotificationScheduleType }) {
  const methods = useNotificationScheduleForm({ notificationSchedule })
  const { watch, handleSubmit } = methods
  const type = watch('type')
  const { onSubmit } = useOnSubmitNotificationScheduleForm()
  const debouncedSubmit = useDebouncedCallback(handleSubmit(onSubmit), 500)

  useEffect(() => {
    const { unsubscribe } = watch(() => debouncedSubmit())

    return () => unsubscribe()
  }, [debouncedSubmit, watch])

  return (
    <FormProvider {...methods}>
      <NotificationScheduleRadioGroup className='px-3 pb-3'>
        <RadioGroupItem id='none' value='none'>
          <UIText weight='font-medium'>Send me notifications at all times</UIText>
        </RadioGroupItem>
        <RadioGroupItem id='custom' value='custom'>
          <UIText weight='font-medium'>Custom</UIText>

          {type === 'custom' && (
            <div className='mt-2 flex flex-col gap-3'>
              <NotificationScheduleDayButtons />
              <NotificationScheduleTimeSelects />
            </div>
          )}
        </RadioGroupItem>
      </NotificationScheduleRadioGroup>
    </FormProvider>
  )
}
