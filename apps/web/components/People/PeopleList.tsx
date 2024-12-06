import { useMemo, useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import toast from 'react-hot-toast'

import { WEB_URL } from '@campsite/config/index'
import { OrganizationMember, ProjectMembership, SyncOrganizationMember } from '@campsite/types/generated'
import { Button } from '@campsite/ui/Button'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { useCopyToClipboard } from '@campsite/ui/hooks'
import { DotsHorizontal } from '@campsite/ui/Icons'
import { buildMenuItems } from '@campsite/ui/Menu'
import { LazyLoadingSpinner } from '@campsite/ui/Spinner'
import * as Dialog from '@campsite/ui/src/Dialog'
import { cn } from '@campsite/ui/utils'

import { IndexPageLoading } from '@/components/IndexPages/components'
import { DeactivateMemberDialog } from '@/components/People/DeactivateMemberDialog'
import { MemberRoleDropdown } from '@/components/People/MemberRoleDropdown'
import { PeopleIndexEmptyState } from '@/components/People/PeopleIndexEmptyState'
import { PeopleIndexMemberRow } from '@/components/People/PeopleIndexMemberRow'
import { ReactivateMemberDialog } from '@/components/People/ReactivateMemberDialog'
import { ProjectsManagement } from '@/components/Projects/ProjectsManagement'
import { useScope } from '@/contexts/scope'
import { useCreateViewerDataExport } from '@/hooks/useCreateViewerDataExport'
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser'
import { useGetMemberProjectMemberships } from '@/hooks/useGetMemberProjectMemberships'
import { useIsCommunity } from '@/hooks/useIsCommunity'
import { useListNavigation } from '@/hooks/useListNavigation'
import { useSyncedMembers } from '@/hooks/useSyncedMembers'
import { useUpdateMemberProjectMemberships } from '@/hooks/useUpdateMemberProjectMemberships'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'

import { getMemberDOMId, roleFilterAtom, rootFilterAtom, searchAtom } from './PeopleIndex'

export const PEOPLE_LIST_NAVIGATION_CONTAINER_ID = 'members-list'

export function PeopleList() {
  const rootFilter = useAtomValue(rootFilterAtom)
  const [roleFilter] = useAtom(roleFilterAtom)
  const query = useAtomValue(searchAtom)
  const shouldSearch = rootFilter === 'active'
  const canFilterRole = rootFilter === 'active' && !!roleFilter
  const { members, isLoading, total } = useSyncedMembers({
    query: shouldSearch ? query : undefined,
    includeDeactivated: rootFilter === 'deactivated' || !!query,
    deactivated: rootFilter === 'deactivated',
    onlyRole: canFilterRole ? roleFilter : undefined
  })
  const hasMembers = !!members?.length
  const isOnlyMember = total === 1

  const { selectItem } = useListNavigation({
    items: members || [],
    getItemDOMId: getMemberDOMId
  })

  return (
    <>
      {isLoading && <IndexPageLoading />}
      {!isLoading && !hasMembers && <PeopleIndexEmptyState />}
      {!isLoading && hasMembers && (
        <>
          {isOnlyMember && (
            <div>
              <PeopleIndexEmptyState description='You are the only member of your organization.' />
            </div>
          )}
          <ul id={PEOPLE_LIST_NAVIGATION_CONTAINER_ID} className='-mx-2 flex flex-col gap-px'>
            {members.map((member, itemIndex) => (
              <PeopleIndexMemberRow
                key={member.id}
                id={getMemberDOMId(member)}
                member={member}
                onFocus={() => selectItem({ itemIndex })}
                onPointerMove={() => selectItem({ itemIndex, scroll: false })}
              >
                {member.deactivated ? (
                  <DeactivatedMemberActions member={member} />
                ) : (
                  <ActiveMemberActions member={member} />
                )}
              </PeopleIndexMemberRow>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

function ActiveMemberActions({ member }: { member: SyncOrganizationMember }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1'
        // 'opacity-0 group-focus-within:opacity-100 group-has-[button[aria-expanded="true"]]:opacity-100'
      )}
    >
      <MemberRole member={member} />
      <OrganizationMemberOverflowMenu member={member} />
    </div>
  )
}

function MemberRole({ member }: { member: SyncOrganizationMember }) {
  const viewerIsAdmin = useViewerIsAdmin()
  const { data: currentUser } = useGetCurrentUser()
  const memberIsViewer = currentUser?.id === member.user.id

  if (memberIsViewer || !viewerIsAdmin) {
    return (
      <Button size='sm' variant='plain' disabled className='pointer-events-none'>
        {member.role.slice(0, 1).toUpperCase() + member.role.slice(1)}
      </Button>
    )
  }

  return <MemberRoleDropdown member={member} value={member.role} />
}

export function OrganizationMemberOverflowMenu({ member }: { member: SyncOrganizationMember | OrganizationMember }) {
  const { scope } = useScope()
  const viewerIsAdmin = useViewerIsAdmin()
  const { data: currentUser } = useGetCurrentUser()
  const memberIsViewer = currentUser?.id === member.user.id
  const [deactivateDialogIsOpen, setDeactivateDialogIsOpen] = useState(false)
  const [guestDialogIsOpen, setGuestDialogIsOpen] = useState(false)
  const { mutate: createDataExport } = useCreateViewerDataExport()
  const [copy] = useCopyToClipboard()

  function onCopyMemberId() {
    copy(member.id)
    toast('Member ID copied to clipboard')
  }

  function onCopyMemberProfileUrl() {
    copy(`${WEB_URL}/${scope}/people/${member.user.username}`)
    toast('Profile URL copied to clipboard')
  }

  function onCopyMemberEmail() {
    copy(member.user.email)
    toast('Email copied to clipboard')
  }

  function onExportData() {
    createDataExport(null, {
      onSuccess: () => toast('A download link will be emailed to you shortly.')
    })
  }

  const canDeactivate = viewerIsAdmin && !memberIsViewer
  const canManageSpaceAccess = member.role === 'guest' && viewerIsAdmin
  const isCommunity = useIsCommunity()

  const items = buildMenuItems([
    canManageSpaceAccess && {
      label: 'Manage channel access',
      type: 'item',
      onSelect: () => setGuestDialogIsOpen(true)
    },
    canManageSpaceAccess && { type: 'separator' },
    !isCommunity && { label: 'Copy email', type: 'item', onSelect: onCopyMemberEmail },
    { label: 'Copy link to profile', type: 'item', onSelect: onCopyMemberProfileUrl },
    { label: 'Copy member ID', type: 'item', onSelect: onCopyMemberId },
    memberIsViewer && { label: 'Export my posts', type: 'item', onSelect: onExportData },
    canDeactivate && { type: 'separator' },
    canDeactivate && {
      label: 'Deactivate',
      type: 'item',
      onSelect: () => setDeactivateDialogIsOpen(true),
      destructive: true
    }
  ])

  return (
    <>
      <DeactivateMemberDialog member={member} open={deactivateDialogIsOpen} onOpenChange={setDeactivateDialogIsOpen} />
      <GuestMemberDialog member={member} open={guestDialogIsOpen} onOpenChange={setGuestDialogIsOpen} />
      <DropdownMenu
        align='start'
        items={items}
        trigger={<Button iconOnly={<DotsHorizontal />} size='sm' variant='plain' accessibilityLabel='More options' />}
      />
    </>
  )
}

function DeactivatedMemberActions({ member }: { member: SyncOrganizationMember }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const viewerIsAdmin = useViewerIsAdmin()

  if (!viewerIsAdmin) return null

  return (
    <>
      <ReactivateMemberDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} member={member} />
      <Button
        onClick={() => setIsDialogOpen(true)}
        size='sm'
        variant='plain'
        className='opacity-0 group-focus-within:opacity-100'
      >
        Reactivate
      </Button>
    </>
  )
}

function GuestMemberDialog({
  member,
  open,
  onOpenChange
}: {
  member: SyncOrganizationMember | OrganizationMember
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data, isLoading } = useGetMemberProjectMemberships({
    memberUsername: member.user.username,
    enabled: open
  })
  const memberProjects = data?.data

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} disableDescribedBy>
      <Dialog.Header>
        <Dialog.Title>Manage {member.user.display_name}’s channel access</Dialog.Title>
      </Dialog.Header>
      {!memberProjects || isLoading ? (
        <Dialog.Content className='flex items-center justify-center p-2'>
          <LazyLoadingSpinner />
        </Dialog.Content>
      ) : (
        <InnerGuestMemberDialog member={member} memberProjects={memberProjects} onOpenChange={onOpenChange} />
      )}
    </Dialog.Root>
  )
}

function InnerGuestMemberDialog({
  member,
  memberProjects,
  onOpenChange
}: {
  member: SyncOrganizationMember | OrganizationMember
  memberProjects: ProjectMembership[]
  onOpenChange: (open: boolean) => void
}) {
  const [query, setQuery] = useState('')
  const updateMemberProjectMemberships = useUpdateMemberProjectMemberships({ memberUsername: member.user.username })
  const [addedProjectIds, setAddedProjectIds] = useState<Set<string>>(new Set())
  const [removedProjectIds, setRemovedProjectIds] = useState<Set<string>>(new Set())
  const initialProjectIds = useMemo(
    () => new Set(memberProjects.map((project) => project.project.id)),
    [memberProjects]
  )

  function onSave() {
    updateMemberProjectMemberships.mutate(
      {
        add_project_ids: Array.from(addedProjectIds),
        remove_project_ids: Array.from(removedProjectIds)
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        }
      }
    )
  }

  return (
    <>
      <ProjectsManagement
        query={query}
        setQuery={setQuery}
        initialProjectIds={initialProjectIds}
        addedProjectIds={addedProjectIds}
        onAddedProjectIdsChange={setAddedProjectIds}
        removedProjectIds={removedProjectIds}
        onRemovedProjectIdsChange={setRemovedProjectIds}
      />
      <Dialog.Footer>
        <Dialog.TrailingActions>
          <Button
            variant='flat'
            onClick={() => {
              onOpenChange(false)
              setAddedProjectIds(new Set())
              setRemovedProjectIds(new Set())
              setQuery('')
            }}
          >
            Cancel
          </Button>
          <Button
            variant='primary'
            onClick={onSave}
            disabled={
              (addedProjectIds.size === 0 && removedProjectIds.size === 0) || updateMemberProjectMemberships.isPending
            }
          >
            Save
          </Button>
        </Dialog.TrailingActions>
      </Dialog.Footer>
    </>
  )
}
