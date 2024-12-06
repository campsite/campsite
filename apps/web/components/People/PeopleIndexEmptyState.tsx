import { useAtomValue } from 'jotai'

import { UIText, UserCircleIcon } from '@campsite/ui'

import { IndexPageEmptyState } from '@/components/IndexPages/components'
import { InvitePeopleButton } from '@/components/People/InvitePeopleButton'
import {
  PeopleIndexFilterType,
  roleFilterAtom,
  RoleType,
  rootFilterAtom,
  searchAtom
} from '@/components/People/PeopleIndex'

function getLabel(rootFilter: PeopleIndexFilterType, roleFilter?: RoleType, isSearching?: boolean) {
  if (rootFilter === 'active' && isSearching) {
    return {
      title: 'No results',
      description: 'Search or invite more people to your organization.'
    }
  }

  if (rootFilter === 'invited') {
    return {
      title: 'No invitations',
      description: 'Invite more people to your organization.'
    }
  }

  if (rootFilter === 'deactivated') {
    return {
      title: 'No deactivated members',
      description: 'When someone is deactivated they will show up here.'
    }
  }

  if (roleFilter) {
    return {
      title: `No ${roleFilter}s`,
      description: 'Invite more people to your organization.'
    }
  }

  return {
    title: 'Invite your team',
    description: ''
  }
}

export function PeopleIndexEmptyState({ description: customDescription }: { description?: string }) {
  const query = useAtomValue(searchAtom)
  const rootFilter = useAtomValue(rootFilterAtom)
  const roleFilter = useAtomValue(roleFilterAtom)
  const isSearching = !!query

  const { title, description } = getLabel(rootFilter, roleFilter, isSearching)

  const uiDescription = customDescription || description

  return (
    <IndexPageEmptyState>
      <UserCircleIcon size={32} />

      <div className='flex flex-col gap-1'>
        <UIText size='text-base' weight='font-semibold'>
          {title}
        </UIText>
        {uiDescription && (
          <UIText size='text-base' tertiary>
            {uiDescription}
          </UIText>
        )}
      </div>

      <div className='flex items-center justify-center'>
        <InvitePeopleButton variant='flat' label='Invite your team' />
      </div>
    </IndexPageEmptyState>
  )
}
