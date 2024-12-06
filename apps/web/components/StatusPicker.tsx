import { useState } from 'react'

import { Button } from '@campsite/ui'

import { UpdateStatusDialog } from '@/components/Home/UpdateStatusDialog'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetOrganizationMember } from '@/hooks/useGetOrganizationMember'

import { MemberStatus } from './MemberStatus'

export function StatusPicker() {
  const { data: currentUser } = useGetCurrentUser()
  const { data: member } = useGetOrganizationMember({ username: currentUser?.username ?? '', enabled: true })

  const [open, setOpen] = useState(false)

  return (
    <>
      <UpdateStatusDialog open={open} onOpenChange={setOpen} />
      <Button
        className='text-tertiary hover:text-primary'
        variant='plain'
        tooltip='Change status'
        accessibilityLabel='Change status'
        iconOnly={<MemberStatus asTrigger status={member?.status} disabled={open} />}
        onClick={() => setOpen(true)}
      />
    </>
  )
}
