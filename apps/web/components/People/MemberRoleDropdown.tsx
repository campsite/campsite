import * as R from 'remeda'

import { SyncOrganizationMember } from '@campsite/types/generated'
import { Select } from '@campsite/ui'

import { useUpdateOrganizationMemberRole } from '@/hooks/useUpdateOrganizationMemberRole'

interface RoleDropdownProps {
  member: SyncOrganizationMember
  value: string
}

export function MemberRoleDropdown(props: RoleDropdownProps) {
  const { member, value } = props
  const updateMemberRole = useUpdateOrganizationMemberRole()

  const roleOptions = R.filter(
    [
      {
        label: 'Admin',
        value: 'admin',
        sublabel: 'Full access to organization settings and member management.'
      },
      {
        label: 'Member',
        value: 'member',
        sublabel: 'Post, comment, and invite viewers.'
      },
      {
        label: 'Viewer',
        value: 'viewer',
        sublabel: 'Comment on posts and invite other viewers.'
      },
      {
        label: 'Guest',
        value: 'guest',
        sublabel: 'Create and access content only in channels they’ve been added to.'
      }
    ],
    R.isTruthy
  )

  function onRoleChange(id: string, role: string) {
    updateMemberRole.mutate({ id, role })
  }

  const selectedOption = roleOptions.find((role) => role.value === value) ?? roleOptions[1]

  return (
    <>
      <Select
        size='sm'
        variant='plain'
        options={roleOptions}
        align='end'
        showChevron={false}
        value={selectedOption.value}
        onChange={(value) => {
          onRoleChange(member.id, `${value}`)
        }}
        popoverWidth={300}
      />
    </>
  )
}
