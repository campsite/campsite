import { ProjectIcon, UIText } from '@campsite/ui'

import { fallbackNameForFavoritableType, iconForFavoritableType } from '@/components/Sidebar/SidebarFavorite'
import { useScope } from '@/contexts/scope'
import { useGetFavorites } from '@/hooks/useGetFavorites'
import { useScopedStorage } from '@/hooks/useScopedStorage'

import { ChatThread } from './ChatThread'
import { HomeNavigationItem } from './HomeNavigationItem'
import { Section } from './Section'
import { SectionHeader } from './SectionHeader'

export function HomeFavorites() {
  const { scope } = useScope()
  const { data: favorites, isLoading } = useGetFavorites()
  const hasFavorites = favorites && favorites.length > 0
  const [collapsed, setCollapsed] = useScopedStorage('home-favorites-collapsed', false)

  if (isLoading) return null

  if (!hasFavorites) {
    return (
      <Section>
        <SectionHeader label='Favorites' onClick={() => setCollapsed(!collapsed)} collapsed={collapsed} />
        {!collapsed && (
          <div className='text-quaternary flex flex-row gap-3 p-4 pt-0.5'>
            <div className='min-w-6' /* keyline with icon */ />
            <UIText inherit>Favorite your most important chat threads and channels.</UIText>
          </div>
        )}
      </Section>
    )
  }

  const filterReadOnly = favorites.filter((fav) => {
    if (fav.project) {
      return fav.project.unread_for_viewer === false
    }

    return true
  })

  return (
    <Section>
      <SectionHeader label='Favorites' onClick={() => setCollapsed(!collapsed)} collapsed={collapsed} />
      {!collapsed && (
        <div className='flex flex-col gap-0.5'>
          {filterReadOnly.map((fav) => {
            let children: React.ReactNode = null

            if (fav.project) {
              children = (
                <HomeNavigationItem
                  unread={fav.project.unread_for_viewer}
                  href={`/${scope}/projects/${fav.project.id}`}
                  icon={
                    fav.project.accessory ? (
                      <UIText className='font-["emoji"] text-[17px]'>{fav.project.accessory}</UIText>
                    ) : (
                      <ProjectIcon size={24} className='text-tertiary' />
                    )
                  }
                  label={fav.project.name}
                />
              )
            } else if (fav.message_thread) {
              children = <ChatThread thread={fav.message_thread} />
            } else {
              children = (
                <HomeNavigationItem
                  href={fav.url}
                  icon={iconForFavoritableType(fav.favoritable_type, 24)}
                  label={fav.name ?? fallbackNameForFavoritableType(fav.favoritable_type)}
                />
              )
            }

            return (
              <div key={fav.id} id={fav.id} className='group/reorder-item relative'>
                {children}
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}
