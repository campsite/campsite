import { Button } from '@campsite/ui/Button'
import { AlarmCheckIcon, AlarmIcon, InboxArchiveIcon, InboxUnarchiveIcon } from '@campsite/ui/Icons'

import { useInboxSplitView } from '@/components/InboxItems/InboxSplitView'

export function InboxTriageActions() {
  const splitView = useInboxSplitView()

  if (!splitView || !splitView.detailItem) return null

  const { triggerDelete, triggerFollowUp, detailItem } = splitView
  const followUp = detailItem?.type === 'notification' && detailItem.item.follow_up_subject

  return (
    <div className='flex items-center gap-3 border-r pr-3.5'>
      {followUp && (
        <Button
          variant='base'
          onClick={() => triggerFollowUp(detailItem.item)}
          iconOnly={followUp.viewer_follow_up ? <AlarmCheckIcon /> : <AlarmIcon />}
          tooltip='Follow up'
          accessibilityLabel='Follow up'
          tooltipShortcut='f'
        />
      )}
      {detailItem.type === 'notification' && detailItem.item.archived ? (
        <Button
          variant='base'
          onClick={() => triggerDelete(detailItem.item)}
          iconOnly={<InboxUnarchiveIcon />}
          tooltip='Unarchive notification'
          accessibilityLabel='Unarchive notification'
          tooltipShortcut='e'
        />
      ) : (
        <Button
          variant='base'
          onClick={() => triggerDelete(detailItem.item)}
          iconOnly={<InboxArchiveIcon />}
          tooltip='Archive notification'
          accessibilityLabel='Archive notification'
          tooltipShortcut='e'
        />
      )}
    </div>
  )
}
