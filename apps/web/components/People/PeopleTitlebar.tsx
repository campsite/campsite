import { useAtom } from 'jotai'

import { Button, Link } from '@campsite/ui'

import { InvitePeopleButton } from '@/components/People/InvitePeopleButton'
import { rootFilterAtom } from '@/components/People/PeopleIndex'
import { PeopleBreadcrumbIcon } from '@/components/Titlebar/BreadcrumbPageIcons'
import { BreadcrumbLabel, BreadcrumbTitlebar } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'

import { PeopleRootFilter } from './PeopleRootFilter'

export function PeopleTitlebar() {
  const { scope } = useScope()

  return (
    <BreadcrumbTitlebar>
      <Link draggable={false} href={`/${scope}`} className='flex items-center gap-3'>
        <PeopleBreadcrumbIcon />
        <BreadcrumbLabel>People</BreadcrumbLabel>
      </Link>
      <PeopleRootFilter />

      <div className='flex-1' />

      <InvitePeopleButton />
    </BreadcrumbTitlebar>
  )
}

export function MobilePeopleTitlebar() {
  const [rootFilter, setRootFilter] = useAtom(rootFilterAtom)
  const viewerIsAdmin = useViewerIsAdmin()

  if (!viewerIsAdmin) return null

  return (
    <BreadcrumbTitlebar className='flex h-auto gap-1 py-1.5 lg:hidden'>
      <Button fullWidth onClick={() => setRootFilter('active')} variant={rootFilter === 'active' ? 'flat' : 'plain'}>
        Active
      </Button>
      <Button fullWidth onClick={() => setRootFilter('invited')} variant={rootFilter === 'invited' ? 'flat' : 'plain'}>
        Invited
      </Button>
      <Button
        fullWidth
        onClick={() => setRootFilter('deactivated')}
        variant={rootFilter === 'deactivated' ? 'flat' : 'plain'}
      >
        Deactivated
      </Button>
    </BreadcrumbTitlebar>
  )
}
