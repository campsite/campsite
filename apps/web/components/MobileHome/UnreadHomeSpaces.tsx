import { ProjectIcon, UIText } from '@campsite/ui'

import { useScope } from '@/contexts/scope'
import { useGetFavorites } from '@/hooks/useGetFavorites'
import { useGetProjectMemberships } from '@/hooks/useGetProjectMemberships'

import { HomeNavigationItem } from './HomeNavigationItem'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

export function UnreadHomeSpaces() {
  const { scope } = useScope()
  const { data: projectMemberships, isLoading: isLoadingProjectMemberships } = useGetProjectMemberships()
  const { isLoading: isLoadingFavorites } = useGetFavorites()

  if (isLoadingFavorites || isLoadingProjectMemberships) return null

  const unreadSpaces = projectMemberships?.filter((membership) => membership.project.unread_for_viewer)
  const hasJoinedSpaces = !!projectMemberships?.length

  if (!hasJoinedSpaces) return null
  if (!unreadSpaces?.length) return null

  return (
    <Section>
      <SectionHeader label='Unread channels' />
      <div className='flex flex-col gap-0.5'>
        {unreadSpaces?.map(({ project }) => (
          <HomeNavigationItem
            unread={project.unread_for_viewer}
            href={`/${scope}/projects/${project.id}`}
            icon={
              project.accessory ? (
                <UIText className='font-["emoji"] text-[20px]'>{project.accessory}</UIText>
              ) : (
                <ProjectIcon size={24} className='text-tertiary' />
              )
            }
            label={project.name}
            key={project.id}
          />
        ))}
      </div>
    </Section>
  )
}
