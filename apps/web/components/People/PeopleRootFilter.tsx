import { useAtom } from 'jotai'

import { Button, LayeredHotkeys } from '@campsite/ui'

import { useViewerIsAdmin } from '@/hooks/useViewerIsAdmin'

import { rootFilterAtom } from './PeopleIndex'

export function PeopleRootFilter() {
  const [rootFilter, setRootFilter] = useAtom(rootFilterAtom)
  const viewerIsAdmin = useViewerIsAdmin()

  if (!viewerIsAdmin) return null

  return (
    <div className='ml-2 flex flex-1 items-center gap-1'>
      <LayeredHotkeys keys='1' callback={() => setRootFilter('active')} options={{ enabled: viewerIsAdmin }} />
      <LayeredHotkeys keys='2' callback={() => setRootFilter('invited')} options={{ enabled: viewerIsAdmin }} />
      <LayeredHotkeys keys='3' callback={() => setRootFilter('deactivated')} options={{ enabled: viewerIsAdmin }} />

      <Button
        size='sm'
        tooltip='Active'
        tooltipShortcut='1'
        onClick={() => setRootFilter('active')}
        variant={rootFilter === 'active' ? 'flat' : 'plain'}
      >
        Active
      </Button>
      <Button
        size='sm'
        tooltip='Invited'
        tooltipShortcut='2'
        onClick={() => setRootFilter('invited')}
        variant={rootFilter === 'invited' ? 'flat' : 'plain'}
      >
        Invited
      </Button>
      <Button
        size='sm'
        tooltip='Deactivated'
        tooltipShortcut='3'
        onClick={() => setRootFilter('deactivated')}
        variant={rootFilter === 'deactivated' ? 'flat' : 'plain'}
      >
        Deactivated
      </Button>
    </div>
  )
}
