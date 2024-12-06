import { FormEvent, KeyboardEvent, MouseEvent, useMemo, useState } from 'react'
import { selectPeers, useHMSStore } from '@100mslive/react-sdk'
import { useRouter } from 'next/router'
import { OnChangeValue } from 'react-select'

import { Button } from '@campsite/ui'

import {
  OrganizationMemberMultiSelect,
  OrganizationMemberMultiSelectOptionType,
  organizationMemberToMultiSelectOption
} from '@/components/OrganizationMember/OrganizationMemberMultiSelect'
import { useCreateCallRoomInvitation } from '@/hooks/useCreateCallRoomInvitation'
import { useSyncedMembers } from '@/hooks/useSyncedMembers'

interface Props {
  onSuccess: () => void
}

export function InviteMembersForm({ onSuccess }: Props) {
  const [selectedOptions, setSelectedOptions] = useState<OrganizationMemberMultiSelectOptionType[]>([])
  const [query, setQuery] = useState('')
  const router = useRouter()
  const callRoomId = router.query.callRoomId as string
  const { members } = useSyncedMembers({ query, excludeCurrentUser: true })
  const peers = useHMSStore(selectPeers)
  const { mutate: createCallRoomInvitation, isPending } = useCreateCallRoomInvitation({ callRoomId })

  const options: OrganizationMemberMultiSelectOptionType[] = useMemo(() => {
    return members
      .filter((member) => !peers.map((peer) => peer.customerUserId).includes(member.id))
      .map((member) => organizationMemberToMultiSelectOption(member))
  }, [members, peers])

  function handleSubmit(
    e?: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLDivElement>
  ) {
    e?.preventDefault()

    createCallRoomInvitation(
      { member_ids: selectedOptions.map((option) => option.member.id) },
      {
        onSuccess: () => {
          setSelectedOptions([])
          onSuccess()
        }
      }
    )
  }

  function handleChange(newValue: OnChangeValue<OrganizationMemberMultiSelectOptionType, true>) {
    setSelectedOptions(newValue.map((option) => option))
  }

  return (
    <form onSubmit={handleSubmit} className='flex w-full flex-1 flex-col gap-2'>
      <OrganizationMemberMultiSelect
        onChange={handleChange}
        options={options}
        value={selectedOptions}
        className='flex-1 rounded-md border'
        placeholder='Invite specific people...'
        noOptionsMessage={() => 'Nobody found'}
        onInputChange={setQuery}
      />
      <Button disabled={selectedOptions.length === 0 || isPending} type='submit' variant='primary'>
        Invite
      </Button>
    </form>
  )
}
