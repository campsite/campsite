import * as SettingsSection from 'components/SettingsSection'
import { useCreateInboundMembershipRequest } from 'hooks/useCreateInboundMembershipRequest'
import { useGetSuggestedOrganizations } from 'hooks/useGetSuggestedOrganizations'

import { SuggestedOrganization } from '@campsite/types'
import { Avatar, Button, Table, TableRow, UIText } from '@campsite/ui'

export function SuggestedOrganizationsTable() {
  const getSuggestedOrganizations = useGetSuggestedOrganizations()

  const organizations = getSuggestedOrganizations.data

  if (!organizations || organizations.length === 0) return null

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>Suggested organizations</SettingsSection.Title>
      </SettingsSection.Header>

      <div className='flex flex-col'>
        <OrganizationsRows organizations={organizations} />
      </div>
    </SettingsSection.Section>
  )
}

interface OrganizationsRowsProps {
  organizations: SuggestedOrganization[]
}

function OrganizationsRows(props: OrganizationsRowsProps) {
  const { organizations } = props
  const requestMembership = useCreateInboundMembershipRequest()

  async function handleRequest(organization: SuggestedOrganization) {
    await requestMembership.mutate({ slug: organization.slug })
  }

  return (
    <Table>
      {organizations.map((organization) => (
        <TableRow key={organization.id}>
          <div className='flex-1 text-sm'>
            <div className='flex items-center'>
              <Avatar rounded='rounded-md' size='base' name={organization.name} urls={organization.avatar_urls} />

              <div className='ml-3'>
                <UIText weight='font-medium'>{organization.name}</UIText>
              </div>
            </div>
          </div>

          <div className='flex w-full items-center justify-end space-x-3 sm:w-auto'>
            <Button
              fullWidth
              variant='primary'
              disabled={organization.requested}
              onClick={() => handleRequest(organization)}
            >
              {organization.requested ? 'Requested' : 'Request to join'}
            </Button>
          </div>
        </TableRow>
      ))}
    </Table>
  )
}
