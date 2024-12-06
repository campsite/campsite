import { Button, CompassIcon, Link, PlusIcon, ProjectIcon, UIText } from '@campsite/ui'

import { useScope } from '@/contexts/scope'
import { useGetCurrentOrganization } from '@/hooks/useGetCurrentOrganization'
import { useGetFavorites } from '@/hooks/useGetFavorites'
import { useGetProjectMemberships } from '@/hooks/useGetProjectMemberships'
import { useScopedStorage } from '@/hooks/useScopedStorage'

import { HomeNavigationItem } from './HomeNavigationItem'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'
import { useCreateProjectDialog } from './useCreateProjectDialog'

export function HomeSpaces() {
  const { scope } = useScope()
  const { data: favorites, isLoading: isLoadingFavorites } = useGetFavorites()
  const { data: projectMemberships, isLoading: isLoadingProjectMemberships } = useGetProjectMemberships()
  const [collapsed, setCollapsed] = useScopedStorage('home-spaces-collapsed', false)
  const { setCreateProjectOpen, createProjectDialog } = useCreateProjectDialog()
  const { data: organization } = useGetCurrentOrganization()

  if (isLoadingFavorites || isLoadingProjectMemberships) return null

  const filteredProjectMemberships = projectMemberships
    ?.filter((membership) => !favorites?.some((fav) => fav.project?.id === membership.project.id))
    .filter((membership) => !membership.project.archived)
    .filter((membership) => !membership.project.unread_for_viewer)
  const hasJoinedSpaces = !!filteredProjectMemberships?.length

  if (!hasJoinedSpaces) {
    return (
      <Section>
        <SectionHeader onClick={() => setCollapsed(!collapsed)} collapsed={collapsed} label='Channels' />

        {!collapsed && (
          <div className='text-quaternary flex flex-row gap-3 p-4 pt-0.5'>
            <div className='min-w-6' /* keyline with icon */ />
            <div className='flex flex-col gap-1'>
              <UIText inherit>Join channels for quick access to projects, teams, and topics you care about.</UIText>
              {organization?.viewer_can_see_projects_index && (
                <Link href={`/${scope}/projects`} className='text-blue-500 hover:underline'>
                  <UIText inherit>Browse all channels</UIText>
                </Link>
              )}
            </div>
          </div>
        )}
      </Section>
    )
  }

  return (
    <Section>
      <SectionHeader label='Channels' onClick={() => setCollapsed(!collapsed)} collapsed={collapsed}>
        {organization?.viewer_can_see_new_project_button && (
          <Button
            variant='plain'
            className='text-quaternary -mr-1'
            iconOnly={<PlusIcon size={24} />}
            accessibilityLabel='New channel'
            onClick={() => setCreateProjectOpen(true)}
          />
        )}
      </SectionHeader>

      {!collapsed && (
        <div className='flex flex-col gap-0.5'>
          {filteredProjectMemberships?.map((projectMembership) => (
            <HomeNavigationItem
              unread={projectMembership.project.unread_for_viewer}
              href={`/${scope}/projects/${projectMembership.project.id}`}
              icon={
                projectMembership.project.accessory ? (
                  <UIText className='font-["emoji"] text-[20px]'>{projectMembership.project.accessory}</UIText>
                ) : (
                  <ProjectIcon size={24} className='text-tertiary' />
                )
              }
              label={projectMembership.project.name}
              key={projectMembership.id}
            />
          ))}
          {organization?.viewer_can_see_projects_index && (
            <HomeNavigationItem
              href={`/${scope}/projects`}
              icon={<CompassIcon size={24} />}
              label='Browse all channels'
            />
          )}
          {organization?.viewer_can_see_new_project_button && (
            <HomeNavigationItem
              onClick={() => setCreateProjectOpen(true)}
              icon={<PlusIcon size={24} />}
              label='New channel'
            />
          )}
        </div>
      )}

      {createProjectDialog}
    </Section>
  )
}
