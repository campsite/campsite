import { useState } from 'react'

import { PublicOrganization } from '@campsite/types'
import { Avatar, Button, Link, UIText } from '@campsite/ui'

import { EmptyState } from '@/components/EmptyState'
import { FullPageLoading } from '@/components/FullPageLoading'
import * as SettingsSection from '@/components/SettingsSection'
import { LeaveOrganizationDialog } from '@/components/UserSettings/OrganizationsTable/LeaveOrganizationDialog'
import { useGetOrganizationMemberships } from '@/hooks/useGetOrganizationMemberships'

export function OrganizationsTable() {
  const { data: memberships, isLoading } = useGetOrganizationMemberships()

  if (isLoading) return <FullPageLoading />
  if (!memberships?.length)
    return (
      <EmptyState
        title='You are not in any organizations'
        message='You are not a member of any organizations yet. Create an organization or join an existing one by invitation.'
      >
        <div className='mt-4'>
          <Button href='/new'>Create organization</Button>
        </div>
      </EmptyState>
    )

  return (
    <SettingsSection.Section>
      <div className='flex flex-col divide-y'>
        {memberships &&
          memberships.map(({ organization }) => <OrganizationRow organization={organization} key={organization.id} />)}
      </div>
    </SettingsSection.Section>
  )
}

interface RowProps {
  organization: PublicOrganization
}

function OrganizationRow(props: RowProps) {
  const { organization } = props
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div key={organization.id} className='flex items-center gap-4 pr-3'>
      <Link href={`/${organization.slug}`} className='group flex flex-1 items-center gap-3 p-3'>
        <Avatar rounded='rounded-md' urls={organization.avatar_urls} name={organization.name} size='base' />

        <UIText weight='font-medium' className='group-hover:underline'>
          {organization.name}
        </UIText>
      </Link>
      {organization.viewer_is_admin && <Button href={`/${organization.slug}/settings`}>Settings</Button>}

      {organization.viewer_can_leave && (
        <>
          <LeaveOrganizationDialog organization={organization} open={isOpen} onOpenChange={setIsOpen} />
          <Button onClick={() => setIsOpen(true)}>Leave</Button>
        </>
      )}
    </div>
  )
}
