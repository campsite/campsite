import { useState } from 'react'
import { useRouter } from 'next/router'

import { Button, Link } from '@campsite/ui'

import { CreateProjectDialog } from '@/components/Projects/Create/CreateProjectDialog'
import { ProjectsIndexRootFilter } from '@/components/Projects/ProjectsIndexRootFilter'
import { ProjectAccessoryBreadcrumbIcon } from '@/components/Titlebar/BreadcrumbPageIcons'
import { BreadcrumbLabel, BreadcrumbTitlebar } from '@/components/Titlebar/BreadcrumbTitlebar'
import { useScope } from '@/contexts/scope'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'

export function ProjectsIndexTitlebar() {
  const { scope } = useScope()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { data: organization } = useGetCurrentOrganization()

  return (
    <BreadcrumbTitlebar>
      <Link draggable={false} href={`/${scope}/projects`} className='flex items-center gap-3'>
        <ProjectAccessoryBreadcrumbIcon />
        <BreadcrumbLabel>Channels</BreadcrumbLabel>
      </Link>

      <ProjectsIndexRootFilter />

      <div className='flex-1' />

      {organization?.viewer_can_see_new_project_button && (
        <>
          <CreateProjectDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onCreate={() => setCreateDialogOpen(false)}
          />
          <Button variant='primary' onClick={() => setCreateDialogOpen(true)}>
            New channel
          </Button>
        </>
      )}
    </BreadcrumbTitlebar>
  )
}

export function MobileProjectsIndexTitlebar() {
  const router = useRouter()
  const { scope } = useScope()
  const isActive = router.pathname === '/[org]/projects'
  const isArchived = router.pathname === '/[org]/projects/archived'

  return (
    <BreadcrumbTitlebar className='flex h-auto gap-1 py-1.5 lg:hidden'>
      <Button size='sm' fullWidth href={`/${scope}/projects`} variant={isActive ? 'flat' : 'plain'}>
        Active
      </Button>
      <Button size='sm' fullWidth href={`/${scope}/projects/archived`} variant={isArchived ? 'flat' : 'plain'}>
        Archived
      </Button>
    </BreadcrumbTitlebar>
  )
}
