import { format } from 'date-fns'

import { Badge } from '../Badge'
import { ClockIcon } from '../Icons'

function followUpShortString(show_at: string) {
  if (!show_at) return

  const viewerFollowUpIsToday = format(show_at, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  const viewerFollowUpIsMoreThanOneWeekAway =
    new Date(show_at) > new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)

  if (viewerFollowUpIsToday) {
    return format(show_at, 'p')
  } else if (viewerFollowUpIsMoreThanOneWeekAway) {
    return format(show_at, 'ccc, MMM do')
  } else {
    return format(show_at, 'EEE')
  }
}

interface Props {
  followUpAt: string | null | undefined
}

export function FollowUpTag({ followUpAt }: Props) {
  if (!followUpAt) return null

  return (
    <Badge
      tooltip={`Follow-up scheduled for ${format(followUpAt, 'PPp')}`}
      color='orange'
      className='flex items-center font-mono'
      icon={<ClockIcon size={14} strokeWidth='2' />}
    >
      {followUpShortString(followUpAt)}
    </Badge>
  )
}
