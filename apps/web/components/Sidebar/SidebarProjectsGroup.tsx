import { useRef, useState } from 'react'
import { Reorder } from 'framer-motion'
import { useRouter } from 'next/router'

import { cn, CompassIcon, DotsHorizontal, Link, PlusIcon, ReorderDotsIcon, UIText } from '@campsite/ui'
import { DropdownMenu } from '@campsite/ui/DropdownMenu'
import { buildMenuItems } from '@campsite/ui/Menu'

import { CreateProjectDialog } from '@/components/Projects/Create/CreateProjectDialog'
import { SidebarCollapsibleButton } from '@/components/Sidebar/SidebarCollapsibleButton'
import { SidebarGroup } from '@/components/Sidebar/SidebarGroup'
import { SidebarLink } from '@/components/Sidebar/SidebarLink'
import { SidebarProject } from '@/components/Sidebar/SidebarProject'
import { useScope } from '@/contexts/scope'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetFavorites } from '@/hooks/useGetFavorites'
import { useGetProjectMemberships } from '@/hooks/useGetProjectMemberships'
import { useReorderProjectMemberships } from '@/hooks/useReorderProjectMemberships'
import { useScopedStorage } from '@/hooks/useScopedStorage'

export function SidebarProjectsGroup() {
  const router = useRouter()
  const { scope } = useScope()
  const { data: favorites } = useGetFavorites()
  const { data: projectMemberships, isLoading: isLoadingProjectMemberships } = useGetProjectMemberships()
  const { isLoading: isLoadingFavorites } = useGetFavorites()
  const { onReorder, mutation: reorder } = useReorderProjectMemberships()
  const filteredProjectMemberships = projectMemberships
    ?.filter((membership) => !favorites?.some((fav) => fav.project?.id === membership.project.id))
    .filter((membership) => !membership.project.archived)
  const [collapsed, setCollapsed] = useScopedStorage('sidebar-projects-collapsed', false)
  const hasJoinedSpaces = !!filteredProjectMemberships?.length
  const [draggingId, setDraggingId] = useState<undefined | string>()
  const containerRef = useRef<HTMLDivElement>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { data: organization } = useGetCurrentOrganization()

  if (isLoadingFavorites || isLoadingProjectMemberships) {
    return null
  }

  if (!hasJoinedSpaces) {
    return (
      <SidebarGroup>
        <SidebarCollapsibleButton collapsed={collapsed} setCollapsed={setCollapsed} label='Channels' />
        {!collapsed && (
          <div className='text-quaternary p-2 pt-0.5'>
            <div className='flex flex-col gap-1'>
              <UIText size='text-xs' inherit>
                Join channels for quick access to projects, teams, and topics you care about.
              </UIText>
              {organization?.viewer_can_see_projects_index && (
                <Link href={`/${scope}/projects`} className='text-blue-500 hover:underline'>
                  <UIText size='text-xs' inherit>
                    Browse all channels
                  </UIText>
                </Link>
              )}
            </div>
          </div>
        )}
      </SidebarGroup>
    )
  }

  const sortedIds = filteredProjectMemberships.sort((a, b) => a.position - b.position).map((f) => f.id)
  const selectedProjectId = router.query.projectId as string
  const unreadAndSelectedItems = filteredProjectMemberships.filter((membership) => {
    return membership.project.unread_for_viewer || membership.project.id === selectedProjectId
  })

  const renderableItems = collapsed ? unreadAndSelectedItems : filteredProjectMemberships

  const items = buildMenuItems([
    organization?.viewer_can_see_new_project_button && {
      type: 'item',
      label: 'New channel',
      onSelect: () => setCreateDialogOpen(true),
      leftSlot: <PlusIcon />
    },
    organization?.viewer_can_see_projects_index && {
      type: 'item',
      label: 'Browse all channels',
      url: `/${scope}/projects`,
      leftSlot: <CompassIcon />,
      onSelect: () => setDropdownOpen(false)
    }
  ])

  function setCollapsedAndTrack(collapsed: boolean) {
    setCollapsed(collapsed)
  }

  return (
    <SidebarGroup className='group/spaces'>
      <div className='flex items-center gap-px'>
        <SidebarCollapsibleButton collapsed={collapsed} setCollapsed={setCollapsedAndTrack} label='Channels' />
        {items.length > 0 && (
          <DropdownMenu
            // this has to be manually controlled otherwise the dropdown won't close when navigating to the Channels page
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
            align='start'
            side='bottom'
            sideOffset={2}
            items={items}
            trigger={
              <button className='hover:bg-quaternary data-[state="open"]:bg-quaternary group flex h-6 w-6 items-center justify-center rounded-md p-0.5 opacity-0 focus:outline-0 focus:ring-0 group-hover/spaces:opacity-100 group-has-[[data-state="open"]]/spaces:opacity-100 data-[state="open"]:opacity-100'>
                <span className='scale-[85%]'>
                  <DotsHorizontal />
                </span>
              </button>
            }
          />
        )}
      </div>

      <Reorder.Group
        key={collapsed ? 'collapsed' : 'expanded'}
        ref={containerRef}
        axis='y'
        values={sortedIds}
        onReorder={onReorder}
        className='flex flex-col gap-px'
      >
        {renderableItems?.map((projectMembership) => (
          <Reorder.Item
            key={projectMembership.id}
            value={projectMembership.id}
            id={projectMembership.id}
            layout='position'
            drag={!collapsed}
            dragConstraints={containerRef}
            dragElastic={0.065}
            onDragStart={() => setDraggingId(projectMembership.id)}
            onDragEnd={() => {
              setDraggingId(undefined)
              reorder.mutate(sortedIds)
            }}
            className={cn('group/reorder-item relative', {
              'opacity-60': draggingId === projectMembership.id,
              'pointer-events-none': !!draggingId
            })}
          >
            {!collapsed && (
              <span className='text-quaternary absolute -left-[11px] top-1/2 -translate-y-1/2 cursor-move opacity-0 group-hover/reorder-item:opacity-100 group-has-[[data-state="open"]]/reorder-item:opacity-100'>
                <ReorderDotsIcon strokeWidth='2' size={16} />
              </span>
            )}
            <SidebarProject key={projectMembership.id} project={projectMembership.project} location='projects' />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {!collapsed && organization?.viewer_can_see_new_project_button && (
        <SidebarLink
          id='new-projects'
          label='New channel'
          onClick={() => setCreateDialogOpen(true)}
          leadingAccessory={<PlusIcon />}
        />
      )}

      <CreateProjectDialog
        onOpenChange={setCreateDialogOpen}
        open={createDialogOpen}
        onCreate={(channel) => {
          setCreateDialogOpen(false)
          router.push(`/${scope}/projects/${channel.id}`)
        }}
      />
    </SidebarGroup>
  )
}
