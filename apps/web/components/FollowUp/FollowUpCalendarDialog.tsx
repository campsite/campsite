import { useState } from 'react'
import { addDays, addYears, setHours, setMinutes } from 'date-fns'

import { Button } from '@campsite/ui/Button'
import { Calendar } from '@campsite/ui/Calendar'
import { Dialog } from '@campsite/ui/Dialog'

import { defaultCustomDate } from '@/components/FollowUp/utils'

export function FollowUpCalendarDialog({
  open,
  onOpenChange,
  onCreate
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: ({ show_at }: { show_at: string }) => void
}) {
  const [customDate, setCustomDate] = useState<Date | undefined>(defaultCustomDate)

  return (
    <Dialog.Root
      size='fit'
      open={open}
      onOpenChange={onOpenChange}
      visuallyHiddenTitle='Custom follow up date'
      visuallyHiddenDescription='Select a date to create a follow up'
    >
      <Dialog.Content className='place-self-center p-6'>
        <div className='flex h-full w-full flex-col gap-3'>
          <Calendar
            initialFocus
            fromDate={addDays(new Date(), 1)}
            toDate={addYears(new Date(), 1)}
            mode='single'
            selected={customDate}
            onSelect={(date) => setCustomDate(date)}
          />
          <Button
            fullWidth
            className='py-1'
            variant='primary'
            onClick={() => {
              if (customDate) {
                onCreate({ show_at: setMinutes(setHours(customDate, 9), 0).toISOString() })
                onOpenChange(false)
              }
            }}
          >
            {customDate ? `Create follow up` : 'Select a date'}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
