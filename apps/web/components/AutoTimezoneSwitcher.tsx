import { useMemo } from 'react'
import { useAtom } from 'jotai'

import { Button } from '@campsite/ui/Button'
import * as Dialog from '@campsite/ui/src/Dialog'
import { UIText } from '@campsite/ui/Text'

import { lastSwitchedTimezoneAtom, useCreateUserTimezone } from '@/hooks/useCreateUserTimezone'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { timezones } from '@/utils/timezones'

export function AutoTimezoneSwitcher() {
  const timezone = useGetCurrentUser().data?.timezone
  const [lastSwitchedTimezone, setLastSwitchedTimezone] = useAtom(lastSwitchedTimezoneAtom)
  const updateTimezone = useCreateUserTimezone()

  const { offsetChanged, localTimezone, formattedTimezone, formattedLocalTimezone } = useMemo(() => {
    const now = new Date()
    const localTimezoneOffset = now.getTimezoneOffset()
    const localTimezone = timezones.find((t) => t.offset === localTimezoneOffset)
    const formattedTimezone = timezones.find((t) => t.utc.includes(timezone || ''))

    return {
      // only prompt the user to switch their tz if the actual UTC offset changes
      offsetChanged:
        !!timezone &&
        new Date(now.toLocaleString('en-US', { timeZone: timezone })).getTimezoneOffset() !== localTimezoneOffset,
      localTimezone: localTimezone?.utc[0],
      formattedLocalTimezone: localTimezone?.value,
      formattedTimezone: formattedTimezone?.value
    }
  }, [timezone])

  const open = offsetChanged && lastSwitchedTimezone !== localTimezone && lastSwitchedTimezone !== timezone

  if (!open || localTimezone == null) return null

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setLastSwitchedTimezone(localTimezone)
        }
      }}
    >
      <Dialog.Header>
        <Dialog.Title>Update your timezone</Dialog.Title>
        <Dialog.Description className='flex flex-col gap-2'>
          <UIText>
            Your current timezone setting ({formattedTimezone}) differs from your local timezone (
            {formattedLocalTimezone}).
          </UIText>
          <UIText>Change this any time in account settings.</UIText>
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.LeadingActions>
          <Button variant='flat' onClick={() => setLastSwitchedTimezone(localTimezone)}>
            Cancel
          </Button>
        </Dialog.LeadingActions>
        <Dialog.TrailingActions>
          <Button onClick={() => updateTimezone.mutate({ timezone: localTimezone })}>Update timezone</Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
