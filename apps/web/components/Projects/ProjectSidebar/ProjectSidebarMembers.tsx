/* eslint-disable max-lines */
import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import pluralize from 'pluralize'
import { v4 as uuid } from 'uuid'

import { OrganizationMember, Project } from '@campsite/types'
import { Command } from '@campsite/ui'
import { Avatar } from '@campsite/ui/Avatar'
import { Button } from '@campsite/ui/Button'
import { HighlightedCommandItem } from '@campsite/ui/Command'
import { ButtonPlusIcon, DotsHorizontal, LockIcon, PlusIcon, SearchIcon, TrashIcon } from '@campsite/ui/Icons'
import { Link } from '@campsite/ui/Link'
import * as Dialog from '@campsite/ui/src/Dialog'
import { UIText } from '@campsite/ui/Text'
import { TextField } from '@campsite/ui/TextField'

import { GuestBadge } from '@/components/GuestBadge'
import { InfiniteLoader } from '@/components/InfiniteLoader'
import { MemberHovercard } from '@/components/InlinePost/MemberHovercard'
import { MemberAvatar } from '@/components/MemberAvatar'
import { ProjectRemoveLastPrivateProjectMembershipDialog } from '@/components/Projects/ProjectDialogs/ProjectRemoveLastPrivateProjectMembershipDialog'
import { ProjectGuestInviteLinkField } from '@/components/Projects/ProjectGuestInviteLinkField'
import { ProjectMembershipButton } from '@/components/Projects/ProjectMembershipButton'
import { useScope } from '@/contexts/scope'
import { useCreateProjectMembership } from '@/hooks/useCreateProjectMembership'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetProjectAddableMembers } from '@/hooks/useGetProjectAddableMembers'
import { useGetProjectMembers } from '@/hooks/useGetProjectMembers'
import { useInviteOrganizationMembers } from '@/hooks/useInviteOrganizationMembers'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { flattenInfiniteData } from '@/utils/flattenInfiniteData'

import { ProjectRemoveMembershipDialog } from '../ProjectDialogs/ProjectRemoveMembershipDialog'

// ----------------------------------------------------------------------------

function SearchPeopleDialogBody({
  project,
  onInviteGuests,
  onClose
}: {
  project: Project
  onInviteGuests: () => void
  onClose: () => void
}) {
  const router = useRouter()
  const { scope } = useScope()
  const getProjectMembers = useGetProjectMembers({ projectId: project.id, limit: 50 })
  const existingProjectMembers = useMemo(() => flattenInfiniteData(getProjectMembers.data), [getProjectMembers.data])
  const getAddableMembers = useGetProjectAddableMembers({ projectId: project.id, enabled: project.viewer_can_update })
  const addableMembers = useMemo(() => flattenInfiniteData(getAddableMembers.data), [getAddableMembers.data])
  const { data: currentUser } = useGetCurrentUser()
  const createProjectMembership = useCreateProjectMembership(project.id)
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [lastMemberDialogOpen, setlastMemberDialogOpen] = useState(false)
  const oneMemberRemaining = project.members_and_guests_count === 1
  const warnLeavingPrivateProject = project.viewer_is_member && project.private && oneMemberRemaining
  const isCommunity = useIsCommunity()

  function handleMemberSelection(member: OrganizationMember) {
    if (!project.viewer_can_update) {
      router.push(`/${scope}/people/${member.user.username}`)
      return
    }

    if (warnLeavingPrivateProject) {
      setlastMemberDialogOpen(true)
    } else {
      setMemberToRemove(member)
    }
  }

  function onAdd(userId: string) {
    createProjectMembership.mutate({ userId })
  }

  return (
    <>
      {memberToRemove && (
        <ProjectRemoveMembershipDialog
          project={project}
          user={memberToRemove.user}
          open
          onOpenChange={(val) => {
            inputRef.current?.focus()
            if (!val) setMemberToRemove(null)
          }}
        />
      )}

      <ProjectRemoveLastPrivateProjectMembershipDialog
        project={project}
        open={lastMemberDialogOpen}
        onOpenChange={setlastMemberDialogOpen}
      />

      <Dialog.Header className='pb-0'>
        <Dialog.Title>Channel members</Dialog.Title>
      </Dialog.Header>

      <Command className='flex min-h-[30dvh] flex-1 flex-col overflow-hidden' loop>
        <div className='flex items-center gap-3 border-b px-3'>
          <div className='flex h-6 w-6 items-center justify-center'>
            <SearchIcon className='text-quaternary' />
          </div>
          <Command.Input
            ref={inputRef}
            placeholder='Search people...'
            className='w-full border-0 bg-transparent py-3 pl-0 pr-4 text-[15px] placeholder-gray-400 outline-none focus:border-black focus:border-black/5 focus:ring-0'
            autoFocus
          />
        </div>

        <Command.List className='scrollbar-hide overflow-y-auto'>
          <Command.Empty className='flex h-full w-full flex-1 flex-col items-center justify-center gap-1 p-8 pt-12'>
            <UIText weight='font-medium' quaternary>
              Nobody found
            </UIText>
          </Command.Empty>

          <Command.Group className='p-3'>
            <div className='p-2'>
              <UIText weight='font-medium' tertiary>
                Members
              </UIText>
            </div>
            {existingProjectMembers?.map((member) => (
              <HighlightedCommandItem
                key={member.user.id}
                className={'group h-10 gap-3 rounded-lg pr-1.5'}
                onSelect={() => handleMemberSelection(member)}
              >
                <Avatar deactivated={member.deactivated} urls={member.user.avatar_urls} size='sm' />
                <div className='line-clamp-1 flex flex-1 items-center gap-3'>
                  {member.user.display_name}
                  {member.role === 'guest' && <GuestBadge />}
                </div>
                {project.viewer_can_update && (
                  <Button
                    variant='plain'
                    className='opacity-0 hover:bg-red-500 hover:text-white group-data-[selected="true"]:opacity-100 dark:hover:bg-red-500'
                    accessibilityLabel='Remove member'
                  >
                    {member.user.id === currentUser?.id ? 'Leave' : 'Remove'}
                  </Button>
                )}
              </HighlightedCommandItem>
            ))}
          </Command.Group>

          <InfiniteLoader
            hasNextPage={!!getProjectMembers.hasNextPage}
            isError={!!getProjectMembers.isError}
            isFetching={!!getProjectMembers.isFetching}
            isFetchingNextPage={!!getProjectMembers.isFetchingNextPage}
            fetchNextPage={getProjectMembers.fetchNextPage}
          />

          {addableMembers && addableMembers.length > 0 && project.viewer_can_update && (
            <Command.Group className='bg-secondary border-t p-3'>
              <div className='flex flex-col gap-2 p-2'>
                <UIText weight='font-medium' tertiary>
                  Add new members
                </UIText>
                {project.private && (
                  <div className='bg-quaternary flex items-start gap-2 rounded-lg p-3'>
                    <LockIcon className='text-tertiary' />
                    <UIText tertiary>
                      This channel is private — all new members will be able to see all previous posts.
                    </UIText>
                  </div>
                )}
              </div>
              {addableMembers.map((member) => (
                <HighlightedCommandItem
                  key={member.user.id}
                  className='group h-10 gap-3 rounded-lg pr-1.5'
                  onSelect={() => {
                    onAdd(member.user.id)
                    inputRef.current?.focus()
                  }}
                >
                  <Avatar deactivated={member.deactivated} urls={member.user.avatar_urls} size='sm' />
                  <div className='line-clamp-1 flex flex-1 items-center gap-3'>
                    {member.user.display_name}
                    {member.role === 'guest' && <GuestBadge />}
                  </div>
                  <Button
                    variant='plain'
                    className='opacity-0 group-data-[selected="true"]:opacity-100'
                    leftSlot={<PlusIcon />}
                  >
                    Add
                  </Button>
                </HighlightedCommandItem>
              ))}
            </Command.Group>
          )}

          <InfiniteLoader
            hasNextPage={!!getAddableMembers.hasNextPage}
            isError={!!getAddableMembers.isError}
            isFetching={!!getAddableMembers.isFetching}
            isFetchingNextPage={!!getAddableMembers.isFetchingNextPage}
            fetchNextPage={getAddableMembers.fetchNextPage}
          />
        </Command.List>
      </Command>

      <Dialog.Footer>
        <Dialog.LeadingActions>
          {project.viewer_can_update && !isCommunity && (
            <Button variant='flat' onClick={onInviteGuests}>
              Invite guests
            </Button>
          )}
        </Dialog.LeadingActions>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={onClose}>
            Done
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </>
  )
}

// ----------------------------------------------------------------------------

function InviteGuestsDialogBody({
  project,
  onManageMembers,
  onClose
}: {
  project: Project
  onManageMembers: () => void
  onClose: () => void
}) {
  const newInvitation = () => ({ email: '', id: uuid() })
  const [invitations, setInvitations] = useState<{ email: string; id: string }[]>([newInvitation()])
  const { mutate: inviteOrganizationMembers } = useInviteOrganizationMembers()

  function handleSubmit() {
    const validInvitations = invitations.filter((invitation) => invitation.email.length > 0)

    if (validInvitations.length === 0) return

    inviteOrganizationMembers(
      {
        invitations: validInvitations.map((invitation) => ({
          email: invitation.email,
          role: 'guest',
          project_ids: [project.id]
        }))
      },
      {
        onSuccess: onClose
      }
    )
  }

  function addInvitation() {
    setInvitations((prev) => [...prev, newInvitation()])
  }

  function removeInvitation(id: string) {
    setInvitations((prev) => prev.filter((invitation) => invitation.id !== id))
  }

  function handleEmailChange({ id, value }: { id: string; value: string }) {
    setInvitations(
      invitations.map((invitation) => (invitation.id === id ? { ...invitation, email: value } : invitation))
    )
  }

  return (
    <>
      <Dialog.Header>
        <Dialog.Title>Invite guests</Dialog.Title>
        <Dialog.Description>
          Guests will only have access to this channel. You aren’t billed for guests.
        </Dialog.Description>
      </Dialog.Header>

      <Dialog.Content>
        <div className='flex flex-col gap-2'>
          {invitations.map((invitation, index) => {
            return (
              <div className='flex gap-2' key={invitation.id}>
                <div className='flex-1'>
                  <TextField
                    type='email'
                    value={invitation.email}
                    onChange={(value) => handleEmailChange({ id: invitation.id, value })}
                    placeholder='Email address'
                    onCommandEnter={handleSubmit}
                    autoFocus={index === invitations.length - 1}
                  />
                </div>
                <Button
                  variant='flat'
                  iconOnly={<TrashIcon />}
                  disabled={index === 0}
                  accessibilityLabel='Remove'
                  onClick={() => removeInvitation(invitation.id)}
                />
              </div>
            )
          })}

          <Button fullWidth className='flex-none' variant='flat' leftSlot={<ButtonPlusIcon />} onClick={addInvitation}>
            Add another
          </Button>

          <div className='flex justify-end'>
            <Button
              variant='important'
              onClick={handleSubmit}
              disabled={invitations.every((i) => i.email.length === 0)}
            >
              Send invitations
            </Button>
          </div>
        </div>
      </Dialog.Content>

      <div className='bg-tertiary dark:bg-secondary flex flex-col gap-1 p-4 pb-5'>
        <UIText weight='font-medium'>Invite with a link</UIText>
        <UIText tertiary className='mb-2'>
          Anyone with this link can join this channel as a guest.
        </UIText>

        <ProjectGuestInviteLinkField projectId={project.id} />
      </div>

      <Dialog.Footer>
        <Dialog.LeadingActions>
          <Button variant='flat' onClick={onManageMembers}>
            Manage members
          </Button>
        </Dialog.LeadingActions>
        <Dialog.TrailingActions>
          <Button variant='flat' onClick={onClose}>
            Done
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </>
  )
}

// ----------------------------------------------------------------------------

function ManageProjectMembersDialog({
  open,
  onOpenChange,
  project,
  mode = 'members',
  setMode
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  mode: 'members' | 'guests'
  setMode: (mode: 'members' | 'guests') => void
}) {
  function handleOpenChange(open: boolean) {
    onOpenChange(open)

    if (!open) {
      setMode('members')
    }
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleOpenChange} size='lg' align='top' disableDescribedBy>
        {mode === 'guests' && (
          <InviteGuestsDialogBody
            project={project}
            onManageMembers={() => setMode('members')}
            onClose={() => handleOpenChange(false)}
          />
        )}
        {mode === 'members' && (
          <SearchPeopleDialogBody
            project={project}
            onInviteGuests={() => setMode('guests')}
            onClose={() => handleOpenChange(false)}
          />
        )}
      </Dialog.Root>
    </>
  )
}

// ----------------------------------------------------------------------------

function SidebarMember({ member }: { member: OrganizationMember }) {
  const { scope } = useScope()

  return (
    <MemberHovercard username={member.user.username}>
      <Link href={`/${scope}/people/${member.user.username}`} className='flex h-6 w-6'>
        <MemberAvatar member={member} key={member.id} size='sm' />
      </Link>
    </MemberHovercard>
  )
}

// ----------------------------------------------------------------------------

interface ProjectSidebarMembersProps {
  project: Project
}

function ProjectSidebarMembers({ project }: ProjectSidebarMembersProps) {
  // the sidebar row can hold 10 members — to avoid dangling buttons, we reduce the limit
  // to account for the ••• and + buttons that are used to view all/add new members
  const limit = project.members_count < 20 ? 19 : 18
  const getMembers = useGetProjectMembers({ projectId: project.id, limit, excludeRoles: ['guest'] })
  const memberCount = getMembers.data?.pages[0].total_count
  const members = useMemo(() => flattenInfiniteData(getMembers.data), [getMembers.data])
  const getGuests = useGetProjectMembers({ projectId: project.id, limit, roles: ['guest'] })
  const guestCount = getGuests.data?.pages[0].total_count
  const guests = useMemo(() => flattenInfiniteData(getGuests.data), [getGuests.data])
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  const [defaultDialogView, setDefaultDialogView] = useState<'members' | 'guests'>('members')

  return (
    <>
      <ManageProjectMembersDialog
        open={manageDialogOpen}
        onOpenChange={setManageDialogOpen}
        project={project}
        mode={defaultDialogView}
        setMode={setDefaultDialogView}
      />

      <div className='group flex flex-col gap-3 border-b px-4 py-4'>
        <div className='flex items-center justify-between'>
          <UIText size='text-xs' tertiary weight='font-medium'>
            {memberCount} {pluralize('member', memberCount)}
          </UIText>
          <button
            onClick={() => setManageDialogOpen(true)}
            className='text-tertiary hover:text-primary opacity-0 group-hover:opacity-100'
          >
            <UIText size='text-xs' inherit weight='font-medium'>
              View all
            </UIText>
          </button>
        </div>
        {members && !!members.length && (
          <div className='flex flex-wrap items-center gap-x-[5px] gap-y-1.5'>
            {members.map((member) => (
              <SidebarMember member={member} key={member.id} />
            ))}
            {project.members_count > limit && (
              <Button
                size='sm'
                round
                onClick={() => setManageDialogOpen(true)}
                iconOnly={<DotsHorizontal />}
                className='h-6 w-6 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white'
                variant='flat'
                accessibilityLabel='View all'
              />
            )}
            {project.viewer_can_update && (
              <Button
                size='sm'
                round
                onClick={() => {
                  setDefaultDialogView('members')
                  setManageDialogOpen(true)
                }}
                iconOnly={<PlusIcon size={16} />}
                className='h-6 w-6 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white'
                variant='flat'
                accessibilityLabel='Add member'
              />
            )}
          </div>
        )}

        {guests && !!guestCount && guestCount > 0 && (
          <div className='flex flex-col gap-3 py-2'>
            <div className='flex items-center justify-between'>
              <UIText size='text-xs' tertiary weight='font-medium'>
                {guestCount} {pluralize('guests', guestCount)}
              </UIText>
            </div>
            <div className='flex flex-wrap items-center gap-x-[5px] gap-y-1.5'>
              {guests.map((member) => (
                <SidebarMember member={member} key={member.id} />
              ))}
              {project.viewer_can_update && (
                <Button
                  size='sm'
                  round
                  onClick={() => {
                    setDefaultDialogView('guests')
                    setManageDialogOpen(true)
                  }}
                  iconOnly={<PlusIcon size={16} />}
                  className='h-6 w-6 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white'
                  variant='flat'
                  accessibilityLabel='Add member'
                />
              )}
            </div>
          </div>
        )}

        <ProjectMembershipButton project={project} joinVariant='important' />
      </div>
    </>
  )
}

// ----------------------------------------------------------------------------

export { ProjectSidebarMembers }
