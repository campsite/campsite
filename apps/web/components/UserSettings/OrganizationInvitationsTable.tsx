import * as SettingsSection from 'components/SettingsSection'
import { useGetCurrentUserOrganizationInvitations } from 'hooks/useGetCurrentUserOrganizationInvitations'

import { OrganizationInvitation } from '@campsite/types'
import { Avatar, Button, Table, TableRow, UIText } from '@campsite/ui'

import { useAcceptOrganizationInvitation } from '@/hooks/useAcceptOrganizationInvitation'
import { useDeclineOrganizationInvitation } from '@/hooks/useDeclineOrganizationInvitation'
import { apiErrorToast } from '@/utils/apiErrorToast'

export function OrganizationInvitationsTable() {
  const { data: organizations } = useGetCurrentUserOrganizationInvitations()

  const hasPendingInvitations = organizations && organizations.length > 0

  return (
    <SettingsSection.Section>
      <SettingsSection.Header>
        <SettingsSection.Title>Pending invitations</SettingsSection.Title>
      </SettingsSection.Header>

      <SettingsSection.Separator />

      {hasPendingInvitations && <InboundOrgInvitations invitations={organizations} />}
      {!hasPendingInvitations && (
        <div className='flex items-center justify-center p-4 pb-6'>
          <UIText color='text-muted'>No pending invitations</UIText>
        </div>
      )}
    </SettingsSection.Section>
  )
}

interface RowsProps {
  invitations: OrganizationInvitation[]
}

function InboundOrgInvitations(props: RowsProps) {
  const { invitations } = props
  const acceptInvite = useAcceptOrganizationInvitation()
  const declineInvite = useDeclineOrganizationInvitation()

  function handleAccept(invitation: OrganizationInvitation) {
    acceptInvite.mutate({ token: invitation?.token as string }, { onError: apiErrorToast })
  }

  function handleDecline(invitation: OrganizationInvitation) {
    declineInvite.mutate({
      id: invitation?.id as string,
      slug: invitation?.organization?.slug as string
    })
  }

  return (
    <Table>
      {invitations.map((invitation) => (
        <TableRow key={invitation.id}>
          <div className='flex-1 text-sm'>
            <div className='flex items-center gap-3'>
              <Avatar
                rounded='rounded-md'
                size='base'
                name={invitation?.organization?.name}
                urls={invitation?.organization?.avatar_urls}
              />

              <UIText weight='font-medium'>{invitation?.organization?.name}</UIText>
            </div>
          </div>

          <div className='flex w-full items-center justify-end gap-2 sm:w-auto'>
            <Button fullWidth onClick={() => handleDecline(invitation)}>
              Decline
            </Button>

            <Button fullWidth variant='primary' onClick={() => handleAccept(invitation)}>
              Accept
            </Button>
          </div>
        </TableRow>
      ))}
    </Table>
  )
}
