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
import { useGetThreads } from '@/hooks/useGetThreads'
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
  const { data: threadsData } = useGetThreads()
  const threads = useMemo(() => threadsData?.threads ?? [], [threadsData])

  const groupThreadOptions: OrganizationMemberMultiSelectOptionType[] = useMemo(() => {
    const lowerQuery = query.toLowerCase()

    return (threads as any[])
      .filter((t: any) => t.group && t.title && (!query || t.title.toLowerCase().includes(lowerQuery)))
      .map((t: any) => ({
        value: `thread:${t.id}`,
        label: t.title,
        member: {
          id: `thread:${t.id}`,
          role: 'member',
          user: {
            id: t.id,
            display_name: t.title,
            username: t.id,
            avatar_url: '',
            avatar_urls: { xs: '', sm: '', base: '', lg: '', xl: '', xxl: '' }
          }
        } as any
      }))
  }, [threads, query])

  const memberOptions: OrganizationMemberMultiSelectOptionType[] = useMemo(() => {
    const peerIds = (peers ?? []).map((peer) => peer.customerUserId)

    return members
      .filter((member) => !peerIds.includes(member.id))
      .map((member) => organizationMemberToMultiSelectOption(member))
  }, [members, peers])

  const options = useMemo(() => [...memberOptions, ...groupThreadOptions], [memberOptions, groupThreadOptions])

  function handleSubmit(
    e?: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLDivElement>
  ) {
    e?.preventDefault()

    const memberIds = selectedOptions
      .filter((o) => !o.value.startsWith('thread:'))
      .map((o) => o.member.id)

    const threadIds = selectedOptions
      .filter((o) => o.value.startsWith('thread:'))
      .map((o) => o.value.replace('thread:', ''))

    createCallRoomInvitation(
      { member_ids: memberIds, thread_ids: threadIds } as any,
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
        placeholder='Invite people or groups...'
        noOptionsMessage={() => 'Nobody found'}
        onInputChange={setQuery}
      />
      <Button disabled={selectedOptions.length === 0 || isPending} type='submit' variant='primary'>
        Invite
      </Button>
    </form>
  )
}
