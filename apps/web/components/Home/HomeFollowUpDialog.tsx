import { useMemo, useState } from 'react'
import { addDays, addYears, format, setHours, setMinutes } from 'date-fns'

import { SubjectFollowUp } from '@campsite/types'
import { Button, Calendar, ClockIcon, CloseIcon, Command, UIText } from '@campsite/ui'
import { HighlightedCommandItem } from '@campsite/ui/Command'
import * as Dialog from '@campsite/ui/src/Dialog'

import { getFollowUpDates } from '@/components/FollowUp'
import { useFollowUpActions } from '@/hooks/useFollowUpActions'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

interface Props {
  title: string
  id: string
  type: string
  viewerFollowUp: SubjectFollowUp | null | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  onBeforeCreate?: () => void
}

export function HomeFollowUpDialog({ title, id, type, viewerFollowUp, open, onOpenChange, onBeforeCreate }: Props) {
  const { createFollowUp, deleteFollowUp, updateFollowUp } = useFollowUpActions({
    subject_id: id,
    subject_type: type
  })
  const { data: currentUser } = useGetCurrentUser()
  const dates = getFollowUpDates({ includeNow: currentUser?.staff })
  const [customDate, setCustomDate] = useState<Date | undefined>()
  const { customFrom, customTo } = useMemo(
    () => ({ customFrom: addDays(new Date(), 1), customTo: addYears(new Date(), 1) }),
    []
  )

  function close() {
    setCustomDate(undefined)
    onOpenChange(false)
  }

  function upsert(date: Date) {
    const show_at = date.toISOString()

    if (viewerFollowUp) {
      updateFollowUp({ id: viewerFollowUp.id, show_at })
    } else {
      createFollowUp({ show_at })
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          close()
        } else {
          onOpenChange(open)
        }
      }}
      size='lg'
      align='top'
      visuallyHiddenDescription='Select a follow up time or date'
    >
      <Dialog.Header className='pb-0'>
        <Dialog.Title>Follow up</Dialog.Title>
        <UIText tertiary>{title}</UIText>
      </Dialog.Header>

      {customDate ? (
        <div className='mt-3 flex flex-col items-center gap-2 p-3.5'>
          <Calendar
            initialFocus
            fromDate={customFrom}
            toDate={customTo}
            mode='single'
            selected={customDate}
            onSelect={(date) => setCustomDate(date)}
            className='w-full'
            classNames={{
              months: '',
              month: 'space-y-2',
              head_row: 'flex justify-between',
              row: 'flex justify-between'
            }}
          />
          <div className='flex w-full items-center justify-end gap-1.5 border-t pt-3'>
            <Button variant='plain' onClick={() => setCustomDate(undefined)}>
              Cancel
            </Button>
            <Button
              variant='primary'
              onClick={() => {
                if (customDate) {
                  onBeforeCreate?.()
                  upsert(setMinutes(setHours(customDate, 9), 0))
                  close()
                }
              }}
            >
              {customDate ? `Create follow up` : 'Select a date'}
            </Button>
          </div>
        </div>
      ) : (
        <Command className='flex flex-1 flex-col overflow-hidden' loop>
          <Command.List className='scrollbar-hide overflow-y-auto p-3'>
            {viewerFollowUp && (
              <HighlightedCommandItem
                onSelect={() => {
                  deleteFollowUp({ id: viewerFollowUp.id })
                  close()
                }}
                className='h-10 gap-2 rounded-lg pl-2 pr-3.5'
              >
                <CloseIcon className='text-tertiary' />
                <UIText className='flex-1'>Remove follow up</UIText>
              </HighlightedCommandItem>
            )}

            {dates?.map((date) => (
              <HighlightedCommandItem
                key={date.label}
                onSelect={() => {
                  onBeforeCreate?.()
                  upsert(date.date)
                  close()
                }}
                className='h-10 gap-2 rounded-lg pl-2 pr-3.5'
              >
                <ClockIcon className='text-tertiary' />
                <UIText className='flex-1'>{date.label}</UIText>
                <UIText tertiary>{format(date.date, date.formatStr)}</UIText>
              </HighlightedCommandItem>
            ))}

            <HighlightedCommandItem
              onSelect={() => setCustomDate(customFrom)}
              className='h-10 gap-2 rounded-lg pl-2 pr-3.5'
            >
              <ClockIcon className='text-tertiary' />
              <UIText className='flex-1'>Custom...</UIText>
            </HighlightedCommandItem>
          </Command.List>
        </Command>
      )}
    </Dialog.Root>
  )
}
