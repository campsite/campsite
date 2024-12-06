import { forwardRef, useImperativeHandle, useState } from 'react'
import { PopoverTrigger } from '@radix-ui/react-popover'
import { addDays, addYears, format, setHours, setMinutes } from 'date-fns'
import { AnimatePresence, m } from 'framer-motion'
import toast from 'react-hot-toast'

import { SubjectFollowUp } from '@campsite/types'
import {
  Button,
  Calendar,
  CloseIcon,
  LayeredHotkeys,
  Popover,
  POPOVER_MOTION,
  PopoverContent,
  PopoverPortal,
  useBreakpoint
} from '@campsite/ui'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { buildMenuItems, MenuItem } from '@campsite/ui/Menu'

import { FollowUpCalendarDialog } from '@/components/FollowUp/FollowUpCalendarDialog'
import { defaultCustomDate, getFollowUpDates } from '@/components/FollowUp/utils'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'

interface FollowUpDropdownProps extends React.PropsWithChildren {
  onCreate: ({ show_at }: { show_at: string }) => void
  onDelete: ({ id }: { id: string }) => void
  followUps: SubjectFollowUp[]
  modal?: boolean
  side?: 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
}

export interface FollowUpDropdownRef {
  toggleDropdown: () => void
  dropdownOpen: boolean
}

function FollowUpHotkeyRegistration({
  dropdownOptions,
  setDropdownOpen
}: {
  dropdownOptions: MenuItem[]
  setDropdownOpen: (open: boolean) => void
}) {
  const dropdownIndexHotkeys = Array.from({ length: dropdownOptions.length }, (_, i) => (i + 1).toString())

  return (
    <LayeredHotkeys
      keys={dropdownIndexHotkeys}
      options={{ enabled: dropdownIndexHotkeys.length > 1 }}
      callback={(kbEvent, hotkeyEvent) => {
        const keyPressed = hotkeyEvent.keys?.join('')

        if (keyPressed) {
          const dropdownItem = dropdownOptions[parseInt(keyPressed) - 1]

          if (dropdownItem && dropdownItem.type === 'item' && dropdownItem.onSelect) {
            dropdownItem.onSelect(kbEvent)
            setDropdownOpen(false)
          }
        }
      }}
    />
  )
}

export const FollowUpDropdown = forwardRef<FollowUpDropdownRef, FollowUpDropdownProps>(function FollowUpDropdown(
  { children, followUps, onCreate, onDelete, modal = true, side = 'top', align = 'center' },
  ref
) {
  const { data: currentUser } = useGetCurrentUser()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [customDate, setCustomDate] = useState<Date | undefined>(defaultCustomDate)
  const isPopover = useBreakpoint('lg')

  useImperativeHandle(ref, () => ({
    toggleDropdown: () => {
      setDropdownOptions(viewerFollowUp ? getDeleteOptions() : getCreateOptions())
      setDropdownOpen(!dropdownOpen)
    },
    dropdownOpen: dropdownOpen
  }))

  const viewerFollowUp = followUps.find((followUp) => followUp.belongs_to_viewer)

  const getDeleteOptions = () =>
    buildMenuItems(
      viewerFollowUp && [
        {
          type: 'item',
          label: `${format(new Date(viewerFollowUp.show_at), 'E M/d, h:mmaaa')}`,
          onSelect: () => onDelete({ id: viewerFollowUp.id }),
          rightSlot: <CloseIcon />
        }
      ]
    )

  const getCreateOptions = () => {
    const dates = getFollowUpDates({ includeNow: currentUser?.staff })

    const dropdownOptions = buildMenuItems(
      dates.map(({ date, label, formatStr }, index) => ({
        type: 'item',
        label,
        rightSlot: <span className='text-tertiary'>{format(date, formatStr)}</span>,
        kbd: `${index + 1}`,
        onSelect: () => {
          toast(`Follow up scheduled for ${format(date, formatStr)}`)
          onCreate({ show_at: date.toISOString() })
        },
        date: date
      }))
    )

    return buildMenuItems([
      ...dropdownOptions,
      {
        type: 'item',
        label: 'Custom',
        kbd: `${dropdownOptions.length + 1}`,
        onSelect: () => setCalendarOpen(true),
        // other items have kbd and rightSlot which remove pr
        className: 'pr-0'
      }
    ])
  }

  const [dropdownOptions, setDropdownOptions] = useState(viewerFollowUp ? getDeleteOptions() : getCreateOptions())

  return (
    <>
      {/* 
        Dynamically set what component is controlled by the button. Initially, 
        when the button is clicked, it should activate the dropdown. Clicking 
        the "Custom" option moves the button's control to the Calendar popover.
      */}
      <div className='relative leading-none'>
        <DropdownMenu
          header={<FollowUpHotkeyRegistration setDropdownOpen={setDropdownOpen} dropdownOptions={dropdownOptions} />}
          open={dropdownOpen}
          onOpenChange={(open) => {
            if (open) {
              setDropdownOptions(viewerFollowUp ? getDeleteOptions() : getCreateOptions())
              setCustomDate(defaultCustomDate)
            }
            setDropdownOpen(open)
          }}
          align={align}
          side={side}
          items={dropdownOptions}
          trigger={children}
          desktop={{ modal }}
        />
        {isPopover && (
          <Popover
            modal={modal}
            open={calendarOpen}
            onOpenChange={(open) => {
              setCalendarOpen(open)
            }}
          >
            <PopoverTrigger asChild>
              <div className={`${calendarOpen && 'absolute inset-0 z-0'}`} />
            </PopoverTrigger>
            <AnimatePresence>
              {calendarOpen && (
                <PopoverPortal forceMount>
                  <PopoverContent>
                    <m.div
                      className='bg-elevated shadow-popover flex flex-col gap-2 rounded-lg border p-3'
                      {...POPOVER_MOTION}
                      initial={false}
                    >
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
                            setCalendarOpen(false)
                          }
                        }}
                      >
                        {customDate ? `Create follow up` : 'Select a date'}
                      </Button>
                    </m.div>
                  </PopoverContent>
                </PopoverPortal>
              )}
            </AnimatePresence>
          </Popover>
        )}

        {!isPopover && (
          <FollowUpCalendarDialog open={calendarOpen} onOpenChange={setCalendarOpen} onCreate={onCreate} />
        )}
      </div>
    </>
  )
})
