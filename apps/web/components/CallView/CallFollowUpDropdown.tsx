import { PropsWithChildren } from 'react'

import { Call } from '@campsite/types'

import { useCreateCallFollowUp } from '@/hooks/useCreateCallFollowUp'
import { useDeleteCallFollowUp } from '@/hooks/useDeleteCallFollowUp'

import { FollowUpDropdown, FollowUpDropdownRef } from '../FollowUp'

export function CallFollowUpDropdown({
  children,
  call,
  followUpRef
}: PropsWithChildren & { call: Call; followUpRef?: React.RefObject<FollowUpDropdownRef> }) {
  const createFollowUp = useCreateCallFollowUp()
  const deleteFollowUp = useDeleteCallFollowUp()

  return (
    <FollowUpDropdown
      ref={followUpRef}
      followUps={call.follow_ups}
      onCreate={({ show_at }) => createFollowUp.mutate({ callId: call.id, show_at })}
      onDelete={({ id }) => deleteFollowUp.mutate({ callId: call.id, id })}
      align='end'
    >
      {children}
    </FollowUpDropdown>
  )
}
