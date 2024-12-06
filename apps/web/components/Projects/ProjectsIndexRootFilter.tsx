import { useRouter } from 'next/router'

import { Button, LayeredHotkeys } from '@campsite/ui'

import { useScope } from '@/contexts/scope'

export function ProjectsIndexRootFilter() {
  const router = useRouter()
  const { scope } = useScope()
  const isActive = router.pathname === '/[org]/projects'
  const isArchived = router.pathname === '/[org]/projects/archived'

  return (
    <div className='ml-2 flex flex-1 items-center gap-1'>
      <LayeredHotkeys keys='1' callback={() => router.push(`/${scope}/projects`)} />
      <LayeredHotkeys keys='2' callback={() => router.push(`/${scope}/projects/archived`)} />

      <Button
        size='sm'
        tooltip='Active'
        tooltipShortcut='1'
        href={`/${scope}/projects`}
        variant={isActive ? 'flat' : 'plain'}
      >
        Active
      </Button>
      <Button
        size='sm'
        tooltip='Archived'
        tooltipShortcut='2'
        href={`/${scope}/projects/archived`}
        variant={isArchived ? 'flat' : 'plain'}
      >
        Archived
      </Button>
    </div>
  )
}
