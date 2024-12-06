import { useState } from 'react'
import * as R from 'remeda'
import { v4 as uuid } from 'uuid'

import { SyncProject } from '@campsite/types'
import { Button, ButtonPlusIcon, Select, TextField, TrashIcon, UIText } from '@campsite/ui'
import * as Dialog from '@campsite/ui/src/Dialog'
import { cn, emailRegex } from '@campsite/ui/src/utils'

import { ProjectsManagement } from '@/components/Projects/ProjectsManagement'
import { useSyncedProjects } from '@/hooks/useSyncedProjects'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'

import { InvitationConfirmationDialog } from './InvitationConfirmationDialog'

interface InvitationFormProps {
  defaultCount?: number
  onInvitationsSent?: () => void
}

export interface FormInvitation {
  id: string
  email: string
  role: string
  projects: SyncProject[]
}

export function InvitationForm({ defaultCount = 1, onInvitationsSent }: InvitationFormProps) {
  const defaultInvitations = Array.from({ length: defaultCount }, () => ({
    id: uuid(),
    email: '',
    role: 'member',
    projects: []
  }))

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [invitations, setInvitations] = useState<FormInvitation[]>(defaultInvitations)
  const { projects } = useSyncedProjects()

  function handleRoleChange(id: string, role: string) {
    setInvitations(
      invitations.map((invitation) => (invitation.id === id ? { ...invitation, role, projects: [] } : invitation))
    )
  }

  function handleEmailChange(id: string, value: string) {
    setInvitations(
      invitations.map((invitation) => (invitation.id === id ? { ...invitation, email: value } : invitation))
    )
  }

  function handleProjectIdsChange(id: string, projectIds: Set<string>) {
    setInvitations(
      invitations.map((invitation) =>
        invitation.id === id
          ? { ...invitation, projects: projects.filter((project) => projectIds.has(project.id)) }
          : invitation
      )
    )
  }

  function handlePaste(id: string, event: React.ClipboardEvent) {
    event.preventDefault()

    const rawValue = event.clipboardData.getData('text/plain')
    const emails = rawValue.split(',').flatMap((email) => {
      const match = email.match(emailRegex)

      // Return the first match or the trimmed email if no match
      // If either is empty, it will be filtered out
      return (match?.at(0) ?? email.trim()) || []
    })

    if (emails.length === 0) return

    setInvitations((state) => {
      const index = state.findIndex((i) => i.id === id)

      return [
        ...state.slice(0, index),
        // Update the current field with the first email
        {
          ...state[index],
          email: emails[0]
        },
        // Add the rest of the emails in new fields
        ...emails.slice(1).map((email) => ({
          id: uuid(),
          email,
          role: 'member',
          expired: false,
          projects: []
        })),
        // Remove any adjacent empty fields equal to the number of new emails
        ...state.slice(index + 1, index + emails.length).filter((i) => i.email),
        ...state.slice(index + emails.length)
      ]
    })
  }

  function onAddInvitation() {
    setInvitations((state) => [
      ...state,
      {
        id: uuid(),
        email: '',
        role: 'member',
        expired: false,
        projects: []
      }
    ])
  }

  function onRemoveInvitation(id: string) {
    setInvitations((state) => {
      if (state.length === 1) {
        return [{ ...state[0], email: '' }]
      } else {
        return state.filter((invitation) => invitation.id !== id)
      }
    })
  }

  function handleOnSubmit(event: any) {
    event.preventDefault()

    setIsDialogOpen(true)
  }

  return (
    <form onSubmit={handleOnSubmit} className='flex flex-col gap-3'>
      <div className='flex flex-col gap-3 max-sm:divide-y'>
        {invitations.map((invitation, index) => (
          <Invitation
            key={invitation.id}
            invitation={invitation}
            index={index}
            defaultCount={defaultCount}
            handleOnSubmit={handleOnSubmit}
            handleRoleChange={handleRoleChange}
            handleEmailChange={handleEmailChange}
            handleProjectIdsChange={handleProjectIdsChange}
            handlePaste={handlePaste}
            onRemoveInvitation={onRemoveInvitation}
          />
        ))}
      </div>

      <Button fullWidth className='flex-none' variant='flat' leftSlot={<ButtonPlusIcon />} onClick={onAddInvitation}>
        Add another
      </Button>

      <div className='flex justify-end'>
        <InvitationConfirmationDialog
          invitations={invitations}
          open={isDialogOpen}
          onCancel={() => setIsDialogOpen(false)}
          onSuccess={() => {
            setIsDialogOpen(false)
            setInvitations(defaultInvitations)
            onInvitationsSent?.()
          }}
        />
      </div>
    </form>
  )
}

function Invitation({
  invitation,
  index,
  defaultCount,
  handleOnSubmit,
  handleRoleChange,
  handleEmailChange,
  handleProjectIdsChange,
  handlePaste,
  onRemoveInvitation
}: {
  invitation: FormInvitation
  index: number
  defaultCount: number
  handleOnSubmit: (event: any) => void
  handleRoleChange: (id: string, role: string) => void
  handleEmailChange: (id: string, value: string) => void
  handleProjectIdsChange: (id: string, projectIds: Set<string>) => void
  handlePaste: (id: string, event: React.ClipboardEvent) => void
  onRemoveInvitation: (id: string) => void
}) {
  const viewerIsAdmin = useViewerIsAdmin()
  const [projectsDialogOpen, setProjectsDialogOpen] = useState(false)

  const roleOptions = R.filter(
    [
      viewerIsAdmin && {
        label: 'Admin',
        value: 'admin',
        sublabel: 'Full access to organization settings and member management.'
      },
      {
        label: 'Member',
        value: 'member',
        sublabel: 'Post, comment, and invite members.'
      },
      {
        label: 'Viewer',
        value: 'viewer',
        sublabel: 'Comment on posts and invite other viewers. You aren’t billed for viewers.'
      },
      {
        label: 'Guest',
        value: 'guest',
        sublabel: 'Create and access content only in channels they’ve been added to. You aren’t billed for guests.'
      }
    ],
    R.isTruthy
  )

  const labelClasses = cn('pb-1', {
    'inline-flex sm:hidden': index > 0
  })

  return (
    <div className='flex flex-col gap-1'>
      <div className='relative flex flex-col gap-3 sm:flex-row'>
        <div className='grow'>
          <UIText tertiary className={labelClasses}>
            Email
          </UIText>
          <TextField
            type='email'
            id={invitation.id}
            name={invitation.id}
            value={invitation.email}
            autoFocus={index > defaultCount - 1 && index > 0}
            placeholder='Email address'
            onCommandEnter={handleOnSubmit}
            onPaste={(event) => handlePaste(invitation.id, event)}
            onChange={(value) => handleEmailChange(invitation.id, value)}
          />
        </div>

        <div className='flex items-end gap-3'>
          <div className='w-full sm:w-[130px]'>
            <UIText tertiary className={labelClasses}>
              Role
            </UIText>

            <Select
              align='end'
              variant='base'
              showChevron
              options={roleOptions}
              popoverWidth={300}
              onChange={(role) => handleRoleChange(invitation.id, role)}
              value={invitation.role}
            />
          </div>

          <Button
            variant='flat'
            iconOnly={<TrashIcon />}
            disabled={index === 0}
            accessibilityLabel='Remove'
            onClick={() => onRemoveInvitation(invitation.id)}
          />
        </div>
      </div>
      {invitation.role === 'guest' && (
        <>
          <UIText tertiary className='text-xs'>
            Access to{' '}
            {invitation.projects.length === 0 && (
              <>
                <Button variant='text' onClick={() => setProjectsDialogOpen(true)} className='text-xs'>
                  no channels
                </Button>
                .
              </>
            )}
            {invitation.projects.length === 1 && (
              <>
                <Button variant='text' onClick={() => setProjectsDialogOpen(true)} className='text-xs'>
                  {invitation.projects[0].name}
                </Button>
                .
              </>
            )}
            {invitation.projects.length > 1 && (
              <>
                <Button variant='text' onClick={() => setProjectsDialogOpen(true)} className='text-xs'>
                  {invitation.projects[0].name} and {invitation.projects.length - 1} other channel
                  {invitation.projects.length > 2 && 's'}
                </Button>
                .
              </>
            )}
          </UIText>
          <MemberProjectsManagementDialog
            open={projectsDialogOpen}
            onOpenChange={setProjectsDialogOpen}
            projectIds={new Set(invitation.projects.map((project) => project.id))}
            onProjectIdsChange={(projectIds) => handleProjectIdsChange(invitation.id, projectIds)}
          />
        </>
      )}
    </div>
  )
}

function MemberProjectsManagementDialog({
  open,
  onOpenChange,
  projectIds,
  onProjectIdsChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectIds: Set<string>
  onProjectIdsChange: (projectIds: Set<string>) => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} align='top' disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>Manage channel access</Dialog.Title>
      </Dialog.Header>
      <ProjectsManagement addedProjectIds={projectIds} onAddedProjectIdsChange={onProjectIdsChange} />
      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button variant='primary' onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </Dialog.Root>
  )
}
