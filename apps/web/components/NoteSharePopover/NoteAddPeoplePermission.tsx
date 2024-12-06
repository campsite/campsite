import { FormEvent, KeyboardEvent, MouseEvent, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { OnChangeValue } from 'react-select'

import { Note, Permission } from '@campsite/types'
import { Button } from '@campsite/ui'

import {
  OrganizationMemberMultiSelect,
  OrganizationMemberMultiSelectOptionType,
  organizationMemberToMultiSelectOption
} from '@/components/OrganizationMember/OrganizationMemberMultiSelect'
import { useCreateNotePermissions } from '@/hooks/useCreateNotePermissions'
import { useSyncedMembers } from '@/hooks/useSyncedMembers'
import { apiErrorToast } from '@/utils/apiErrorToast'

import { NotePeoplePermissionSelect, PERMISSION_ACTIONS } from './NotePeoplePermissionSelect'

interface Props {
  note: Note
  permissions?: Permission[]
}

export function NoteAddPersonPermission({ note, permissions }: Props) {
  const { mutate: createPermissions } = useCreateNotePermissions()
  const [selectedPermission, setSelectedPermission] = useState(PERMISSION_ACTIONS(false)[0].value)
  const [selectedOptions, setSelectedOptions] = useState<OrganizationMemberMultiSelectOptionType[]>([])
  const [query, setQuery] = useState('')
  const { members } = useSyncedMembers({ query })

  const options: OrganizationMemberMultiSelectOptionType[] = useMemo(() => {
    const addedUserIds = new Set(permissions?.map((p) => p.user.id) ?? [])

    addedUserIds.add(note.member.user.id)

    return members
      .filter((member) => !addedUserIds.has(member.user.id))
      .map((member) => organizationMemberToMultiSelectOption(member))
  }, [members, permissions, note.member.user.id])

  function handleSubmit(
    e?: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLDivElement>
  ) {
    e?.preventDefault()

    // guard here because you can't choose "none" while sharing to a new person
    if (selectedPermission === 'none') return

    createPermissions(
      {
        noteId: note.id,
        member_ids: selectedOptions.map((o) => o.member.id),
        permission: selectedPermission
      },
      {
        onSuccess: () => {
          toast('Note shared')
          setSelectedOptions([])
        },
        onError: apiErrorToast
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
        placeholder='Share with specific people...'
        noOptionsMessage={() => 'Nobody found'}
        onInputChange={setQuery}
      />
      {selectedOptions.length > 0 && (
        <div className='flex flex-1 flex-row justify-end gap-2'>
          <NotePeoplePermissionSelect
            allowNone={false}
            selected={selectedPermission}
            onChange={(value) => {
              setSelectedPermission(value)
            }}
          />
          <Button disabled={selectedOptions.length === 0} onClick={handleSubmit} variant='primary'>
            Share
          </Button>
        </div>
      )}
    </form>
  )
}
