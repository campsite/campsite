import { useCallback } from 'react'
import { FormProvider } from 'react-hook-form'
import toast from 'react-hot-toast'

import { NotificationSchedule } from '@campsite/types/generated'
import { Button, Dialog, LoadingSpinner, RadioGroupItem, UIText } from '@campsite/ui/index'

import { NotificationScheduleDayButtons } from '@/components/NotificationSchedule/NotificationScheduleDayButtons'
import { NotificationScheduleRadioGroup } from '@/components/NotificationSchedule/NotificationScheduleRadioGroup'
import { NotificationScheduleTimeSelects } from '@/components/NotificationSchedule/NotificationScheduleTimeSelects'
import { useGetNotificationSchedule } from '@/hooks/useGetNotificationSchedule'
import { useNotificationScheduleForm, useOnSubmitNotificationScheduleForm } from '@/hooks/useNotificationScheduleForm'

export function NotificationScheduleDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: notificationSchedule, isLoading } = useGetNotificationSchedule()

  return (
    <Dialog.Root align='top' open={open} onOpenChange={onOpenChange} size='sm'>
      <Dialog.Header>
        <Dialog.Title>Notification schedule</Dialog.Title>
      </Dialog.Header>
      {isLoading || !notificationSchedule ? (
        <>
          <Dialog.Content>
            <div className='mx-auto my-8'>
              <LoadingSpinner />
            </div>
          </Dialog.Content>
          <Dialog.Footer>
            <Dialog.TrailingActions>
              <Button variant='flat' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant='primary' disabled>
                Save
              </Button>
            </Dialog.TrailingActions>
          </Dialog.Footer>
        </>
      ) : (
        <InnerNotificationScheduleDialog notificationSchedule={notificationSchedule} onOpenChange={onOpenChange} />
      )}
    </Dialog.Root>
  )
}

function InnerNotificationScheduleDialog({
  notificationSchedule,
  onOpenChange
}: {
  notificationSchedule: NotificationSchedule
  onOpenChange: (open: boolean) => void
}) {
  const methods = useNotificationScheduleForm({ notificationSchedule })
  const {
    watch,
    handleSubmit,
    formState: { isValid }
  } = methods
  const type = watch('type')
  const onSuccess = useCallback(() => {
    toast('Notification schedule updated')
    onOpenChange(false)
  }, [onOpenChange])
  const { onSubmit, isPending } = useOnSubmitNotificationScheduleForm({ onSuccess })

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Dialog.Content>
          <NotificationScheduleRadioGroup>
            <RadioGroupItem id='none' value='none'>
              <UIText secondary>Send me notifications at all times</UIText>
            </RadioGroupItem>
            <RadioGroupItem id='custom' value='custom'>
              <UIText secondary>Custom</UIText>
            </RadioGroupItem>

            {type === 'custom' && (
              <>
                <NotificationScheduleDayButtons />
                <NotificationScheduleTimeSelects />

                <UIText secondary className='text-xs'>
                  We’ll only send you notifications during the windows you select. Anything you miss will be in your
                  inbox to review later.
                </UIText>
              </>
            )}
          </NotificationScheduleRadioGroup>
        </Dialog.Content>
        <Dialog.Footer>
          <Dialog.TrailingActions>
            <Button type='button' variant='flat' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' variant='primary' disabled={!isValid || isPending}>
              Save
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </form>
    </FormProvider>
  )
}
