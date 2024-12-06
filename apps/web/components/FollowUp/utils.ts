import { addDays, addHours, addMinutes, nextMonday, roundToNearestMinutes, setHours, setMinutes } from 'date-fns'

export const defaultCustomDate = addDays(new Date(), 1)

export function getFollowUpDates({ includeNow = false }: { includeNow?: boolean }) {
  const dates = [
    {
      date: roundToNearestMinutes(addMinutes(new Date(), 20), { nearestTo: 5 }),
      label: '20 minutes',
      formatStr: 'h:mmaaa'
    },
    {
      date: roundToNearestMinutes(addHours(new Date(), 1), { nearestTo: 15 }),
      label: 'One hour',
      formatStr: 'h:mmaaa'
    },
    {
      date: roundToNearestMinutes(addHours(new Date(), 3), { nearestTo: 15 }),
      label: 'Three hours',
      formatStr: 'h:mmaaa'
    },
    { date: setMinutes(setHours(addDays(new Date(), 1), 9), 0), label: 'Tomorrow', formatStr: 'EEE, haaa' },
    { date: setMinutes(setHours(nextMonday(new Date()), 9), 0), label: 'Next week', formatStr: 'EEE M/d' }
  ]

  if (includeNow) {
    dates.unshift({
      date: new Date(),
      label: 'Now',
      formatStr: 'h:mmaaa'
    })
  }

  return dates
}
