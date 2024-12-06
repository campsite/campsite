import { useInviteOrganizationMembers } from 'hooks/useInviteOrganizationMembers'

import { Button, Caption, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'

import { FormInvitation } from '@/components/OrgSettings/InvitationForm'
import { ProjectAccessory } from '@/components/Projects/ProjectAccessory'

interface Props {
  invitations: FormInvitation[]
  open: boolean
  onCancel: () => void
  onSuccess: () => void
}

export function InvitationConfirmationDialog(props: Props) {
  const { open, onCancel, onSuccess } = props

  const inviteTeamMembers = useInviteOrganizationMembers()

  function handleSendInvitations() {
    const invitations = props.invitations
      .filter((i) => !!i.email)
      .map((i) => ({
        email: i.email,
        role: i.role,
        project_ids: i.projects.map((p) => p.id)
      }))

    inviteTeamMembers.mutate({ invitations }, { onSuccess })
  }

  return (
    <>
      <Button type='submit' variant='important' disabled={props.invitations.every((i) => i.email.length === 0)}>
        Send invitations
      </Button>

      <Dialog.Root open={open} onOpenChange={onCancel} size='lg' align='top'>
        <Dialog.Header>
          <Dialog.Title>Send invitations?</Dialog.Title>
          <Dialog.Description>
            You are about to invite the following team members to your organization. Are you sure?
          </Dialog.Description>
        </Dialog.Header>

        <Dialog.Content>
          <div className='bg-tertiary flex flex-col divide-y rounded-lg px-4 py-1'>
            {props.invitations
              .filter((invitation) => invitation.email.length > 0)
              .map((invitation) => (
                <div key={invitation.email} className='flex flex-col gap-2 py-3'>
                  <div className='flex items-center space-x-2 text-sm'>
                    <UIText secondary selectable className='flex-1 text-left'>
                      {invitation.email}
                    </UIText>
                    <div className='flex-1 text-right uppercase'>
                      <Caption>{invitation.role}</Caption>
                    </div>
                  </div>
                  {invitation.projects.length > 0 && (
                    <ul className='flex flex-col gap-1'>
                      {invitation.projects.map((project) => (
                        <li key={`${invitation.email}:${project.id}`} className='flex items-center gap-1.5'>
                          <ProjectAccessory project={project} />
                          <UIText secondary className='line-clamp-1 flex-1'>
                            {project.name}
                          </UIText>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        </Dialog.Content>

        <Dialog.Footer>
          <Dialog.TrailingActions>
            <Button disabled={inviteTeamMembers.isPending} onClick={onCancel} variant='plain'>
              Cancel
            </Button>
            <Button
              variant='primary'
              disabled={inviteTeamMembers.isPending}
              loading={inviteTeamMembers.isPending}
              onClick={handleSendInvitations}
              autoFocus
            >
              Send
            </Button>
          </Dialog.TrailingActions>
        </Dialog.Footer>
      </Dialog.Root>
    </>
  )
}
