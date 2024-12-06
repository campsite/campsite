import { atom, useAtomValue } from 'jotai'

import { OrganizationInvitation, SyncOrganizationMember } from '@campsite/types'

import { IndexPageContainer, IndexPageContent } from '@/components/IndexPages/components'
import { InboundRequests } from '@/components/People/InboundRequests'

import { InvitedPeopleList } from './InvitedPeopleList'
import { PeopleList } from './PeopleList'
import { PeopleSearchFilter } from './PeopleSearchFilter'
import { MobilePeopleTitlebar, PeopleTitlebar } from './PeopleTitlebar'

const DEFAULT_FILTER = 'active'

export type PeopleIndexFilterType = 'active' | 'invited' | 'deactivated'
export type RoleType = SyncOrganizationMember['role']
export const rootFilterAtom = atom<PeopleIndexFilterType>(DEFAULT_FILTER)
export const searchAtom = atom<string>('')
export const roleFilterAtom = atom<RoleType | undefined>(undefined)

export function PeopleIndex() {
  const rootFilter = useAtomValue(rootFilterAtom)

  return (
    <IndexPageContainer>
      <PeopleTitlebar />
      <MobilePeopleTitlebar />
      <PeopleSearchFilter />

      <IndexPageContent className='max-w-3xl'>
        <InboundRequests />

        {(rootFilter === 'active' || rootFilter === 'deactivated') && <PeopleList />}
        {rootFilter == 'invited' && <InvitedPeopleList />}
      </IndexPageContent>
    </IndexPageContainer>
  )
}

export function getMemberDOMId(member: SyncOrganizationMember) {
  return `organization-member-${member.id}`
}

export function getInvitationDOMId(invitation: OrganizationInvitation) {
  return `organization-invitation-${invitation.id}`
}
