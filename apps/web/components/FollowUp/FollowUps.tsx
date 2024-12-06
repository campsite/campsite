import { SubjectFollowUp } from '@campsite/types'
import { cn, UIText } from '@campsite/ui'

import { ViewLink } from '../Post/PostViewersPopover'

interface FollowUpsProps {
  followUps: SubjectFollowUp[]
  showBorder?: boolean
}

export function FollowUps({ followUps, showBorder = false }: FollowUpsProps) {
  if (!followUps.length) return null

  return (
    <div className={cn('p-1.5', { 'border-b': showBorder })}>
      <div className='p-2'>
        <UIText size='text-xs' weight='font-medium' tertiary>
          Following up
        </UIText>
      </div>
      {followUps.map((f) => (
        <ViewLink key={f.id} member={f.member} />
      ))}
    </div>
  )
}
